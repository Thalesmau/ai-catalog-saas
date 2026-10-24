import { Filter, ObjectId, Sort } from 'mongodb';

import { Product } from '@application/entities/Product';
import { MongoDbClient } from '@infra/clients/MongoDbClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { escapeRegex } from '@shared/utils/escapeRegex';
import { toObjectId } from '@shared/utils/objectId';
import { toAccentInsensitiveRegex, toSearchTerms } from '@shared/utils/searchTerms';

import { COLLECTIONS } from '../collections';
import { ProductDocument, ProductMapper } from '../mappers/ProductMapper';

const SORTS: Record<ProductRepository.SortBy, Sort> = {
  newest: { createdAt: -1, _id: -1 },
  price_asc: { priceInCents: 1, _id: 1 },
  price_desc: { priceInCents: -1, _id: -1 },
  name: { name: 1, _id: 1 },
};

@Injectable()
export class ProductRepository {
  constructor(private readonly mongoDbClient: MongoDbClient) {}

  private get collection() {
    return this.mongoDbClient.collection<ProductDocument>(COLLECTIONS.products);
  }

  async create(companyId: string, data: ProductRepository.CreateInput): Promise<Product> {
    const companyObjectId = toObjectId(companyId);

    if (!companyObjectId) {
      throw new Error(`Invalid companyId "${companyId}".`);
    }

    const now = new Date();

    const doc: ProductDocument = {
      _id: new ObjectId(),
      companyId: companyObjectId,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      category: data.category,
      imageUrl: data.imageUrl ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await this.collection.insertOne(doc);

    return ProductMapper.toEntity(doc);
  }

  async findById(companyId: string, id: string): Promise<Product | null> {
    const filter = this.byId(companyId, id);

    if (!filter) {
      return null;
    }

    const doc = await this.collection.findOne(filter);

    return doc ? ProductMapper.toEntity(doc) : null;
  }

  async list(companyId: string, filters: ProductRepository.ListFilters): Promise<ProductRepository.ListResult> {
    const companyObjectId = toObjectId(companyId);

    if (!companyObjectId) {
      return { items: [], total: 0 };
    }

    const filter = this.buildFilter(companyObjectId, filters);
    const skip = (filters.page - 1) * filters.pageSize;

    const [docs, total] = await Promise.all([
      this.collection
        .find(filter)
        .sort(SORTS[filters.sortBy ?? 'newest'])
        .skip(skip)
        .limit(filters.pageSize)
        .toArray(),
      this.collection.countDocuments(filter),
    ]);

    return {
      items: docs.map(ProductMapper.toEntity),
      total,
    };
  }

  async listCategories(companyId: string): Promise<ProductRepository.CategorySummary[]> {
    const companyObjectId = toObjectId(companyId);

    if (!companyObjectId) {
      return [];
    }

    return this.collection
      .aggregate<ProductRepository.CategorySummary>([
        { $match: { companyId: companyObjectId } },
        {
          $group: {
            _id: '$category',
            productCount: { $sum: 1 },
            minPriceInCents: { $min: '$priceInCents' },
            maxPriceInCents: { $max: '$priceInCents' },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            category: '$_id',
            productCount: 1,
            minPriceInCents: 1,
            maxPriceInCents: 1,
          },
        },
      ])
      .toArray();
  }

  async update(companyId: string, id: string, data: ProductRepository.UpdateInput): Promise<Product | null> {
    const filter = this.byId(companyId, id);

    if (!filter) {
      return null;
    }

    const doc = await this.collection.findOneAndUpdate(
      filter,
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    return doc ? ProductMapper.toEntity(doc) : null;
  }

  async delete(companyId: string, id: string): Promise<boolean> {
    const filter = this.byId(companyId, id);

    if (!filter) {
      return false;
    }

    const { deletedCount } = await this.collection.deleteOne(filter);

    return deletedCount === 1;
  }

  private byId(companyId: string, id: string): Filter<ProductDocument> | null {
    const _id = toObjectId(id);
    const companyObjectId = toObjectId(companyId);

    if (!_id || !companyObjectId) {
      return null;
    }

    return { _id, companyId: companyObjectId };
  }

  private buildFilter(companyId: ObjectId, filters: ProductRepository.ListFilters): Filter<ProductDocument> {
    const filter: Filter<ProductDocument> = { companyId };

    const terms = filters.search ? toSearchTerms(filters.search) : [];

    if (terms.length > 0) {
      const conditions = terms.map((term) => {
        const regex = toAccentInsensitiveRegex(term);
        return { $or: [{ name: regex }, { description: regex }, { category: regex }] };
      });

      if (filters.searchMode === 'any') {
        filter.$or = conditions.flatMap(condition => condition.$or);
      } else {
        filter.$and = conditions;
      }
    } else if (filters.search?.trim()) {
      const literal = new RegExp(escapeRegex(filters.search.trim()), 'i');
      filter.$or = [{ name: literal }, { description: literal }, { category: literal }];
    }

    if (filters.category) {
      filter.category = new RegExp(`^${escapeRegex(filters.category)}$`, 'i');
    }

    if (filters.minPriceInCents !== undefined || filters.maxPriceInCents !== undefined) {
      filter.priceInCents = {
        ...(filters.minPriceInCents !== undefined && { $gte: filters.minPriceInCents }),
        ...(filters.maxPriceInCents !== undefined && { $lte: filters.maxPriceInCents }),
      };
    }

    return filter;
  }
}

export namespace ProductRepository {
  export type CreateInput = {
    name: string;
    description: string;
    priceInCents: number;
    category: string;
    imageUrl?: string | null;
  };

  export type UpdateInput = Partial<CreateInput>;

  export type SortBy = 'newest' | 'price_asc' | 'price_desc' | 'name';

  export type ListFilters = {
    search?: string;
    searchMode?: 'all' | 'any';
    category?: string;
    minPriceInCents?: number;
    maxPriceInCents?: number;
    sortBy?: SortBy;
    page: number;
    pageSize: number;
  };

  export type ListResult = {
    items: Product[];
    total: number;
  };

  export type CategorySummary = {
    category: string;
    productCount: number;
    minPriceInCents: number;
    maxPriceInCents: number;
  };
}
