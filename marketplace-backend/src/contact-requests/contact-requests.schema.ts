import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContactRequestDocument = ContactRequest & Document & { _id: any };

export enum ContactRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true, versionKey: false })
export class ContactRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId;

  @Prop({ type: String, enum: ContactRequestStatus, default: ContactRequestStatus.PENDING })
  status: ContactRequestStatus;

  @Prop()
  message: string;
}

export const ContactRequestSchema = SchemaFactory.createForClass(ContactRequest);

ContactRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });
ContactRequestSchema.index({ receiver: 1, status: 1 });
ContactRequestSchema.index({ sender: 1 });
