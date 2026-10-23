import { ObjectId } from 'mongodb';

import { Company } from '@application/entities/Company';

export type CompanyDocument = {
  _id: ObjectId;
  name: string;
  slug: string;
  inviteCode: string;
  createdAt: Date;
};

export class CompanyMapper {
  static toEntity(doc: CompanyDocument): Company {
    return new Company({
      id: doc._id.toHexString(),
      name: doc.name,
      slug: doc.slug,
      inviteCode: doc.inviteCode,
      createdAt: doc.createdAt,
    });
  }
}
