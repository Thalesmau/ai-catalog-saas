import { Db } from 'mongodb';

import { COLLECTIONS } from './collections';

export async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection(COLLECTIONS.companies).createIndexes([
      { key: { slug: 1 }, name: 'uniq_slug', unique: true },
      { key: { inviteCode: 1 }, name: 'uniq_invite_code', unique: true },
    ]),
    db.collection(COLLECTIONS.accounts).createIndexes([
      { key: { email: 1 }, name: 'uniq_email', unique: true },
      { key: { companyId: 1, createdAt: -1 }, name: 'company_created_at' },
    ]),
    db.collection(COLLECTIONS.products).createIndexes([
      { key: { companyId: 1, createdAt: -1 }, name: 'company_created_at' },
      { key: { companyId: 1, category: 1 }, name: 'company_category' },
      { key: { companyId: 1, priceInCents: 1 }, name: 'company_price' },
      { key: { companyId: 1, name: 1 }, name: 'company_name' },
    ]),
  ]);
}
