import { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { MongoDbClient } from '@infra/clients/MongoDbClient';

import { bearer, createProduct, signUpAdmin, signUpUser, TestSession } from '../helpers/factories';
import { connectTestDatabase, createTestApp, disconnectTestDatabase } from '../helpers/testApp';

describe('tenant isolation', () => {
  let app: Express;
  let mongoDbClient: MongoDbClient;
  let companyA: TestSession;
  let companyB: TestSession;
  let productA: { id: string };

  beforeAll(async () => {
    mongoDbClient = await connectTestDatabase();
    app = await createTestApp();

    companyA = await signUpAdmin(app, 'Empresa A');
    companyB = await signUpAdmin(app, 'Empresa B');

    productA = await createProduct(app, companyA, { name: 'Notebook Pro', category: 'Informática' });
    await createProduct(app, companyB, { name: 'Chá Verde', category: 'Bebidas' });
  });

  afterAll(async () => {
    await disconnectTestDatabase(mongoDbClient);
  });

  it('lists only products of the authenticated company', async () => {
    const listA = await request(app).get('/products').set(...bearer(companyA)).expect(200);
    const listB = await request(app).get('/products').set(...bearer(companyB)).expect(200);

    expect(listA.body.items.map((p: { name: string }) => p.name)).toEqual(['Notebook Pro']);
    expect(listB.body.items.map((p: { name: string }) => p.name)).toEqual(['Chá Verde']);
  });

  it('does not find products of another company by search', async () => {
    const response = await request(app)
      .get('/products')
      .query({ search: 'Notebook' })
      .set(...bearer(companyB))
      .expect(200);

    expect(response.body.total).toBe(0);
  });

  it('returns only categories of the authenticated company', async () => {
    const response = await request(app).get('/products/categories').set(...bearer(companyB)).expect(200);

    expect(JSON.stringify(response.body)).not.toContain('Informática');
  });

  it('answers 404 (not 403) when reading a product of another company', async () => {
    await request(app).get(`/products/${productA.id}`).set(...bearer(companyB)).expect(404);
  });

  it('cannot update a product of another company', async () => {
    await request(app)
      .patch(`/products/${productA.id}`)
      .set(...bearer(companyB))
      .send({ priceInCents: 1 })
      .expect(404);

    const product = await request(app).get(`/products/${productA.id}`).set(...bearer(companyA)).expect(200);
    expect(product.body.priceInCents).not.toBe(1);
  });

  it('cannot delete a product of another company', async () => {
    await request(app).delete(`/products/${productA.id}`).set(...bearer(companyB)).expect(404);

    await request(app).get(`/products/${productA.id}`).set(...bearer(companyA)).expect(200);
  });

  it('rejects companyId sent in the body (strict schema)', async () => {
    const response = await request(app)
      .post('/products')
      .set(...bearer(companyB))
      .send({
        name: 'Produto Intruso',
        description: 'Tentativa de criar no tenant A.',
        priceInCents: 100,
        category: 'Geral',
        companyId: companyA.companyId,
      })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION');
  });

  it('keeps invited users inside their company', async () => {
    const userB = await signUpUser(app, companyB.inviteCode);

    expect(userB.companyId).toBe(companyB.companyId);
    await request(app).get(`/products/${productA.id}`).set(...bearer(userB)).expect(404);
  });

  it('matches searches without accents only inside the tenant', async () => {
    const own = await request(app).get('/products').query({ search: 'cha verde' }).set(...bearer(companyB)).expect(200);
    const other = await request(app).get('/products').query({ search: 'cha verde' }).set(...bearer(companyA)).expect(200);

    expect(own.body.items.map((p: { name: string }) => p.name)).toEqual(['Chá Verde']);
    expect(other.body.total).toBe(0);
  });

  it('treats search input as literal text, not regex', async () => {
    const response = await request(app)
      .get('/products')
      .query({ search: '.*' })
      .set(...bearer(companyA))
      .expect(200);

    expect(response.body.total).toBe(0);
  });
});
