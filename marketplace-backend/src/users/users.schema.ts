import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../common/enums/user-role.enum';

export type UserDocument = User & Document & { _id: any };

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ trim: true })
  displayName: string;

  @Prop()
  bio: string;

  @Prop()
  avatarUrl: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ select: false })
  emailVerificationToken: string;

  @Prop({ select: false })
  passwordResetToken: string;

  @Prop({ select: false })
  passwordResetExpires: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isProfilePublic: boolean;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  whatsapp: string;

  @Prop({ trim: true })
  instagram: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ default: false })
  googleDriveConnected: boolean;

  @Prop({ select: false })
  googleDriveRefreshToken: string;

  @Prop({ select: false })
  googleDriveFolderId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 });
