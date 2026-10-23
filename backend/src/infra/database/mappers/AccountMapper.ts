import { ObjectId } from 'mongodb';

import { Account } from '@application/entities/Account';
import { TRole } from '@shared/types/AuthContext';

export type AccountDocument = {
  _id: ObjectId;
  companyId: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: TRole;
  createdAt: Date;
};

export class AccountMapper {
  static toEntity(doc: AccountDocument): Account {
    return new Account({
      id: doc._id.toHexString(),
      companyId: doc.companyId.toHexString(),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role,
      createdAt: doc.createdAt,
    });
  }
}
