import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Product, ProductDocument, ProductStatus } from './products.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async create(dto: CreateProductDto, ownerId: string): Promise<ProductDocument> {
    const product = new this.productModel({ ...dto, owner: ownerId });
    await product.save();
    return product.populate('owner', 'username displayName avatarUrl');
  }

  async findAll(query: QueryProductsDto = {}): Promise<ProductDocument[]> {
    const filter: FilterQuery<ProductDocument> = {
      status: { $ne: ProductStatus.HIDDEN },
    };

    if (query.owner) filter.owner = query.owner;
    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status;
    if (query.search) filter.$text = { $search: query.search };

    return this.productModel
      .find(filter)
      .populate('owner', 'username displayName avatarUrl')
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  async findMyProducts(ownerId: string): Promise<ProductDocument[]> {
    return this.productModel
      .find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, requestingUserId?: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findById(id)
      .populate('owner', 'username displayName avatarUrl')
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    if (
      product.status === ProductStatus.HIDDEN &&
      product.owner.toString() !== requestingUserId
    ) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, ownerId: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    if (product.owner.toString() !== ownerId) throw new ForbiddenException();
    Object.assign(product, dto);
    await product.save();
    return product.populate('owner', 'username displayName avatarUrl');
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    if (product.owner.toString() !== ownerId) throw new ForbiddenException();
    await product.deleteOne();
  }

  async countByOwner(ownerId: string): Promise<number> {
    return this.productModel.countDocuments({
      owner: ownerId,
      status: { $ne: ProductStatus.HIDDEN },
    });
  }
}
