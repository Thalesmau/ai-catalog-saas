import { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { MongoDbClient } from '@infra/clients/MongoDbClient';

import { bearer, createProduct, signUpAdmin, signUpUser, TestSession } from '../helpers/factories';
import { connectTestDatabase, createTestApp, disconnectTestDatabase } from '../helpers/testApp';

describe('permissions (rbac)', () => {
  let app: Express;
  let mongoDbClient: MongoDbClient;
  let admin: TestSession;
  let user: TestSession;
  let productId: string;

  beforeAll(async () => {
    mongoDbClient = await connectTestDatabase();
    app = await createTestApp();

    admin = await signUpAdmin(app, 'Empresa RBAC');
    user = await signUpUser(app, admin.inviteCode);
    productId = (await createProduct(app, admin, { name: 'Cadeira Gamer' })).id;
  });

  afterAll(async () => {
    await disconnectTestDatabase(mongoDbClient);
  });

  it('lets a user read products of the company', async () => {
    const list = await request(app).get('/products').set(...bearer(user)).expect(200);
    expect(list.body.items).toHaveLength(1);

    await request(app).get(`/products/${productId}`).set(...bearer(user)).expect(200);
    await request(app).get('/products/categories').set(...bearer(user)).expect(200);
  });

  it('forbids a user from creating products', async () => {
    const response = await request(app)
      .post('/products')
      .set(...bearer(user))
      .send({ name: 'Mesa', description: 'Mesa de escritório.', priceInCents: 50000, category: 'Móveis' })
      .expect(403);

    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('forbids a user from updating products', async () => {
    await request(app).patch(`/products/${productId}`).set(...bearer(user)).send({ priceInCents: 1 }).expect(403);
  });

  it('forbids a user from deleting products', async () => {
    await request(app).delete(`/products/${productId}`).set(...bearer(user)).expect(403);

    await request(app).get(`/products/${productId}`).set(...bearer(admin)).expect(200);
  });

  it('lets the admin manage products', async () => {
    const created = await createProduct(app, admin, { name: 'Monitor 27 polegadas' });

    const updated = await request(app)
      .patch(`/products/${created.id}`)
      .set(...bearer(admin))
      .send({ priceInCents: 129900 })
      .expect(200);
    expect(updated.body.priceInCents).toBe(129900);

    await request(app).delete(`/products/${created.id}`).set(...bearer(admin)).expect(204);
    await request(app).get(`/products/${created.id}`).set(...bearer(admin)).expect(404);
  });

  it('requires authentication on every product route', async () => {
    await request(app).get('/products').expect(401);
    await request(app).post('/products').send({}).expect(401);
  });
});
