import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ContactRequest,
  ContactRequestDocument,
  ContactRequestStatus,
} from './contact-requests.schema';
import { SendContactRequestDto } from './dto/send-contact-request.dto';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class ContactRequestsService {
  constructor(
    @InjectModel(ContactRequest.name)
    private contactRequestModel: Model<ContactRequestDocument>,
    private readonly conversationsService: ConversationsService,
  ) {}

  async send(senderId: string, dto: SendContactRequestDto): Promise<ContactRequestDocument> {
    if (senderId === dto.receiverId) {
      throw new BadRequestException('You cannot send a request to yourself');
    }

    const existing = await this.contactRequestModel.findOne({
      $or: [
        { sender: senderId, receiver: dto.receiverId },
        { sender: dto.receiverId, receiver: senderId },
      ],
    });

    if (existing) {
      if (existing.status === ContactRequestStatus.ACCEPTED) {
        throw new BadRequestException('You are already in contact with this collector');
      }
      if (existing.status === ContactRequestStatus.PENDING) {
        throw new BadRequestException('A contact request is already pending');
      }
      // rejected — allow re-send by updating
      existing.status = ContactRequestStatus.PENDING;
      existing.message = dto.message ?? '';
      return existing.save() as any;
    }

    const request = new this.contactRequestModel({
      sender: senderId,
      receiver: dto.receiverId,
      message: dto.message,
    });
    await request.save();
    return request.populate([
      { path: 'sender', select: 'username displayName avatarUrl' },
      { path: 'receiver', select: 'username displayName avatarUrl' },
    ]);
  }

  async getIncoming(userId: string): Promise<ContactRequestDocument[]> {
    return this.contactRequestModel
      .find({ receiver: userId, status: ContactRequestStatus.PENDING })
      .populate('sender', 'username displayName avatarUrl')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getOutgoing(userId: string): Promise<ContactRequestDocument[]> {
    return this.contactRequestModel
      .find({ sender: userId })
      .populate('receiver', 'username displayName avatarUrl')
      .sort({ createdAt: -1 })
      .exec();
  }

  async accept(id: string, userId: string) {
    const request = await this.contactRequestModel.findById(id);
    if (!request) throw new NotFoundException('Request not found');
    if (request.receiver.toString() !== userId) throw new ForbiddenException();
    if (request.status !== ContactRequestStatus.PENDING) {
      throw new BadRequestException('Request is no longer pending');
    }

    request.status = ContactRequestStatus.ACCEPTED;
    await request.save();

    const conversation = await this.conversationsService.findOrCreate([
      request.sender.toString(),
      request.receiver.toString(),
    ]);

    return { request, conversationId: conversation._id };
  }

  async reject(id: string, userId: string): Promise<ContactRequestDocument> {
    const request = await this.contactRequestModel.findById(id);
    if (!request) throw new NotFoundException('Request not found');
    if (request.receiver.toString() !== userId) throw new ForbiddenException();

    request.status = ContactRequestStatus.REJECTED;
    await request.save();
    return request;
  }

  async getStatus(userId: string, otherId: string) {
    const request = await this.contactRequestModel.findOne({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId },
      ],
    });
    if (!request) return { status: 'none' };
    return { status: request.status, id: request._id, isSender: request.sender.toString() === userId };
  }

  async getContacts(userId: string): Promise<ContactRequestDocument[]> {
    return this.contactRequestModel
      .find({
        $or: [{ sender: userId }, { receiver: userId }],
        status: ContactRequestStatus.ACCEPTED,
      })
      .populate('sender', 'username displayName avatarUrl')
      .populate('receiver', 'username displayName avatarUrl')
      .exec();
  }
}
