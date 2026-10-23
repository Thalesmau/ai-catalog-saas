import { ObjectId } from 'mongodb';

import { Company } from '@application/entities/Company';
import { MongoDbClient } from '@infra/clients/MongoDbClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { toObjectId } from '@shared/utils/objectId';

import { COLLECTIONS } from '../collections';
import { CompanyDocument, CompanyMapper } from '../mappers/CompanyMapper';

@Injectable()
export class CompanyRepository {
  constructor(private readonly mongoDbClient: MongoDbClient) {}

  private get collection() {
    return this.mongoDbClient.collection<CompanyDocument>(COLLECTIONS.companies);
  }

  async create(data: CompanyRepository.CreateInput): Promise<Company> {
    const doc: CompanyDocument = {
      _id: new ObjectId(),
      name: data.name,
      slug: data.slug,
      inviteCode: data.inviteCode,
      createdAt: new Date(),
    };

    await this.collection.insertOne(doc);

    return CompanyMapper.toEntity(doc);
  }

  async findById(id: string): Promise<Company | null> {
    const _id = toObjectId(id);

    if (!_id) {
      return null;
    }

    const doc = await this.collection.findOne({ _id });

    return doc ? CompanyMapper.toEntity(doc) : null;
  }

  async findByInviteCode(inviteCode: string): Promise<Company | null> {
    const doc = await this.collection.findOne({ inviteCode });

    return doc ? CompanyMapper.toEntity(doc) : null;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ slug }, { limit: 1 });

    return count > 0;
  }

  async existsByInviteCode(inviteCode: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ inviteCode }, { limit: 1 });

    return count > 0;
  }

  async delete(id: string): Promise<void> {
    const _id = toObjectId(id);

    if (_id) {
      await this.collection.deleteOne({ _id });
    }
  }
}

export namespace CompanyRepository {
  export type CreateInput = {
    name: string;
    slug: string;
    inviteCode: string;
  };
}
