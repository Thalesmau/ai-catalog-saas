/* eslint-disable no-console */
import 'reflect-metadata';

import '@main/config/bindings';

import { PasswordHasher } from '@application/gateways/PasswordHasher';
import { MongoDbClient } from '@infra/clients/MongoDbClient';
import { COLLECTIONS } from '@infra/database/collections';
import { ensureIndexes } from '@infra/database/indexes';
import { AccountRepository } from '@infra/database/repositories/AccountRepository';
import { CompanyRepository } from '@infra/database/repositories/CompanyRepository';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { Registry } from '@kernel/di/Registry';
import { env } from '@shared/config/env';

import { SEED_COMPANIES, SEED_PASSWORD } from './seed-data';

async function seed() {
  const onlyIfEmpty = process.argv.includes('--if-empty');

  if (env.NODE_ENV === 'production' && !onlyIfEmpty && !process.argv.includes('--force')) {
    throw new Error('Seed apaga todos os dados. Em produção, rode com --if-empty ou --force.');
  }

  const registry = Registry.getInstance();
  const mongoDbClient = registry.resolve(MongoDbClient);
  const companyRepository = registry.resolve(CompanyRepository);
  const accountRepository = registry.resolve(AccountRepository);
  const productRepository = registry.resolve(ProductRepository);
  const passwordHasher = registry.resolve(PasswordHasher);

  await mongoDbClient.connect();
  const db = mongoDbClient.db();

  if (onlyIfEmpty && await db.collection(COLLECTIONS.companies).estimatedDocumentCount() > 0) {
    console.log(`Banco "${db.databaseName}" já possui dados, seed ignorado.`);
    await mongoDbClient.disconnect();
    return;
  }

  console.log(`🌱 Seeding database "${db.databaseName}"...`);

  await Promise.all(Object.values(COLLECTIONS).map(name => db.collection(name).deleteMany({})));
  await ensureIndexes(db);

  const passwordHash = await passwordHasher.hash(SEED_PASSWORD);
  const accountsTable: Record<string, string>[] = [];

  for (const seedCompany of SEED_COMPANIES) {
    const company = await companyRepository.create({
      name: seedCompany.name,
      slug: seedCompany.slug,
      inviteCode: seedCompany.inviteCode,
    });

    for (const account of seedCompany.accounts) {
      await accountRepository.create({ ...account, companyId: company.id, passwordHash });

      accountsTable.push({
        empresa: company.name,
        email: account.email,
        senha: SEED_PASSWORD,
        role: account.role,
      });
    }

    for (const product of seedCompany.products) {
      await productRepository.create(company.id, product);
    }

    console.log(`✔ ${company.name}: ${seedCompany.accounts.length} contas, ${seedCompany.products.length} produtos (convite: ${company.inviteCode})`);
  }

  console.log('\nContas de teste:');
  console.table(accountsTable);

  await mongoDbClient.disconnect();
}

seed().catch(async (error) => {
  console.error('❌ Seed falhou:', error);
  await Registry.getInstance().resolve(MongoDbClient).disconnect();
  process.exit(1);
});
