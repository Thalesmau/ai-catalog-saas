import { ObjectId } from 'mongodb';

import { Product } from '@application/entities/Product';

export type ProductDocument = {
  _id: ObjectId;
  companyId: ObjectId;
  name: string;
  description: string;
  priceInCents: number;
  category: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class ProductMapper {
  static toEntity(doc: ProductDocument): Product {
    return new Product({
      id: doc._id.toHexString(),
      companyId: doc.companyId.toHexString(),
      name: doc.name,
      description: doc.description,
      priceInCents: doc.priceInCents,
      category: doc.category,
      imageUrl: doc.imageUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
