import { MongoServerError, ObjectId } from 'mongodb';

import { Account } from '@application/entities/Account';
import { EmailAlreadyInUse } from '@application/errors/application/EmailAlreadyInUse';
import { MongoDbClient } from '@infra/clients/MongoDbClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { TRole } from '@shared/types/AuthContext';
import { toObjectId } from '@shared/utils/objectId';

import { COLLECTIONS } from '../collections';
import { AccountDocument, AccountMapper } from '../mappers/AccountMapper';

const DUPLICATE_KEY_ERROR = 11000;

@Injectable()
export class AccountRepository {
  constructor(private readonly mongoDbClient: MongoDbClient) {}

  private get collection() {
    return this.mongoDbClient.collection<AccountDocument>(COLLECTIONS.accounts);
  }

  async create(data: AccountRepository.CreateInput): Promise<Account> {
    const companyId = toObjectId(data.companyId);

    if (!companyId) {
      throw new Error(`Invalid companyId "${data.companyId}".`);
    }

    const doc: AccountDocument = {
      _id: new ObjectId(),
      companyId,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      createdAt: new Date(),
    };

    try {
      await this.collection.insertOne(doc);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === DUPLICATE_KEY_ERROR) {
        throw new EmailAlreadyInUse();
      }

      throw error;
    }

    return AccountMapper.toEntity(doc);
  }

  async findByEmail(email: string): Promise<Account | null> {
    const doc = await this.collection.findOne({ email });

    return doc ? AccountMapper.toEntity(doc) : null;
  }

  async findById(companyId: string, id: string): Promise<Account | null> {
    const _id = toObjectId(id);
    const companyObjectId = toObjectId(companyId);

    if (!_id || !companyObjectId) {
      return null;
    }

    const doc = await this.collection.findOne({ _id, companyId: companyObjectId });

    return doc ? AccountMapper.toEntity(doc) : null;
  }
}

export namespace AccountRepository {
  export type CreateInput = {
    companyId: string;
    name: string;
    email: string;
    passwordHash: string;
    role: TRole;
  };
}
