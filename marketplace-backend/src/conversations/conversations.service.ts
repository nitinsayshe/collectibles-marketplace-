import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './conversations.schema';
import { Message, MessageDocument } from './messages.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async findOrCreate(participants: string[]): Promise<ConversationDocument> {
    const sorted = [...participants].sort();
    const existing = await this.conversationModel
      .findOne({ participants: { $all: sorted, $size: sorted.length } })
      .exec();
    if (existing) return existing;

    const conv = new this.conversationModel({ participants: sorted });
    await conv.save();
    return conv;
  }

  async getUserConversations(userId: string): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ participants: userId })
      .populate('participants', 'username displayName avatarUrl')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username' } })
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 30): Promise<MessageDocument[]> {
    const conv = await this.conversationModel.findById(conversationId);
    if (!conv) throw new NotFoundException('Conversation not found');
    const isParticipant = conv.participants.some((p) => p.toString() === userId);
    if (!isParticipant) throw new ForbiddenException();

    const skip = (page - 1) * limit;
    const messages = await this.messageModel
      .find({ conversation: conversationId })
      .populate('sender', 'username displayName avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // mark as read
    await this.messageModel.updateMany(
      { conversation: conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    );

    return messages.reverse();
  }

  async createMessage(conversationId: string, senderId: string, dto: CreateMessageDto): Promise<MessageDocument> {
    const conv = await this.conversationModel.findById(conversationId);
    if (!conv) throw new NotFoundException('Conversation not found');
    const isParticipant = conv.participants.some((p) => p.toString() === senderId);
    if (!isParticipant) throw new ForbiddenException();

    const message = new this.messageModel({
      conversation: conversationId,
      sender: senderId,
      content: dto.content,
      readBy: [senderId],
    });
    await message.save();
    await message.populate('sender', 'username displayName avatarUrl');

    conv.lastMessage = message._id;
    conv.lastMessageAt = new Date();
    await conv.save();

    return message;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const convs = await this.conversationModel.find({ participants: userId });
    const convIds = convs.map((c) => c._id);
    return this.messageModel.countDocuments({
      conversation: { $in: convIds },
      sender: { $ne: userId },
      readBy: { $ne: userId },
    });
  }
}
