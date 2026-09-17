import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document & { _id: any };

export enum ProductStatus {
  FOR_SALE = 'for_sale',
  FOR_TRADE = 'for_trade',
  COLLECTION_ONLY = 'collection_only',
  HIDDEN = 'hidden',
}

export enum ProductCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

@Schema({ timestamps: true, versionKey: false })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ trim: true })
  brand: string;

  @Prop({ type: String, enum: ProductCondition })
  condition: ProductCondition;

  @Prop({ type: Number, min: 0 })
  askingPrice: number;

  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.COLLECTION_ONLY })
  status: ProductStatus;

  @Prop()
  imageUrl: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ owner: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ title: 'text', description: 'text' });
