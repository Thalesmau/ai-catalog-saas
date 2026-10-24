import { Express } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { MongoDbClient } from '@infra/clients/MongoDbClient';

import { PASSWORD, signUpAdmin, uniqueEmail } from '../helpers/factories';
import { connectTestDatabase, createTestApp, disconnectTestDatabase } from '../helpers/testApp';

describe('auth', () => {
  let app: Express;
  let mongoDbClient: MongoDbClient;

  beforeAll(async () => {
    mongoDbClient = await connectTestDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await disconnectTestDatabase(mongoDbClient);
  });

  describe('sign-up', () => {
    it('creates a company and its admin when companyName is sent', async () => {
      const email = uniqueEmail();

      const response = await request(app)
        .post('/auth/sign-up')
        .send({ name: 'Ana', email, password: PASSWORD, companyName: 'Loja da Ana' })
        .expect(201);

      expect(response.body.accessToken).toEqual(expect.any(String));
      expect(response.body.account).toMatchObject({ email, role: 'admin' });
      expect(response.body.account).not.toHaveProperty('passwordHash');
      expect(response.body.company.name).toBe('Loja da Ana');
    });

    it('joins an existing company as user with a valid invite code', async () => {
      const admin = await signUpAdmin(app, 'Empresa Convite');

      const response = await request(app)
        .post('/auth/sign-up')
        .send({ name: 'Bruno', email: uniqueEmail(), password: PASSWORD, inviteCode: admin.inviteCode.toLowerCase() })
        .expect(201);

      expect(response.body.account.role).toBe('user');
      expect(response.body.company.id).toBe(admin.companyId);
    });

    it('rejects an unknown invite code', async () => {
      const response = await request(app)
        .post('/auth/sign-up')
        .send({ name: 'Carla', email: uniqueEmail(), password: PASSWORD, inviteCode: 'ZZZZZZZZ' })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_INVITE_CODE');
    });

    it('rejects a duplicated email, case-insensitive', async () => {
      const email = uniqueEmail();
      const body = { name: 'Davi', email, password: PASSWORD, companyName: 'Empresa Davi' };

      await request(app).post('/auth/sign-up').send(body).expect(201);
      const response = await request(app)
        .post('/auth/sign-up')
        .send({ ...body, email: email.toUpperCase() })
        .expect(409);

      expect(response.body.error.code).toBe('EMAIL_ALREADY_IN_USE');
    });

    it.each([
      ['role', { role: 'admin' }],
      ['companyId', { companyId: '507f1f77bcf86cd799439011' }],
    ])('rejects mass assignment of %s', async (_field, extra) => {
      const response = await request(app)
        .post('/auth/sign-up')
        .send({ name: 'Eva', email: uniqueEmail(), password: PASSWORD, inviteCode: 'ABCDEFGH', ...extra })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION');
    });

    it('requires exactly one of companyName or inviteCode', async () => {
      await request(app)
        .post('/auth/sign-up')
        .send({ name: 'Fábio', email: uniqueEmail(), password: PASSWORD, companyName: 'X Corp', inviteCode: 'ABCDEFGH' })
        .expect(400);
    });
  });

  describe('sign-in', () => {
    it('returns a token for valid credentials', async () => {
      const email = uniqueEmail();
      await request(app).post('/auth/sign-up').send({ name: 'Gabi', email, password: PASSWORD, companyName: 'Gabi Ltda' });

      const response = await request(app).post('/auth/sign-in').send({ email, password: PASSWORD }).expect(200);

      expect(response.body.accessToken).toEqual(expect.any(String));
    });

    it('uses the same generic error for wrong password and unknown email', async () => {
      const email = uniqueEmail();
      await request(app).post('/auth/sign-up').send({ name: 'Hugo', email, password: PASSWORD, companyName: 'Hugo SA' });

      const wrongPassword = await request(app).post('/auth/sign-in').send({ email, password: 'errada123' }).expect(401);
      const unknownEmail = await request(app)
        .post('/auth/sign-in')
        .send({ email: uniqueEmail(), password: PASSWORD })
        .expect(401);

      expect(wrongPassword.body).toEqual(unknownEmail.body);
      expect(wrongPassword.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('token validation', () => {
    const secret = () => process.env.JWT_SECRET!;

    it('returns the session on /auth/me with a valid token', async () => {
      const admin = await signUpAdmin(app, 'Empresa Me');

      const response = await request(app).get('/auth/me').set('Authorization', `Bearer ${admin.token}`).expect(200);

      expect(response.body.company.id).toBe(admin.companyId);
    });

    it('rejects requests without a token', async () => {
      await request(app).get('/auth/me').expect(401);
    });

    it('rejects a token with a tampered payload', async () => {
      const admin = await signUpAdmin(app, 'Empresa Tamper');
      const [header, payload, signature] = admin.token.split('.');
      const forged = Buffer.from(JSON.stringify({
        ...JSON.parse(Buffer.from(payload!, 'base64url').toString()),
        cid: '507f1f77bcf86cd799439011',
      })).toString('base64url');

      await request(app).get('/auth/me').set('Authorization', `Bearer ${header}.${forged}.${signature}`).expect(401);
    });

    it('rejects an expired token', async () => {
      const admin = await signUpAdmin(app, 'Empresa Expirada');
      const expired = jwt.sign(
        { cid: admin.companyId, role: 'admin', exp: Math.floor(Date.now() / 1000) - 60 },
        secret(),
        { subject: admin.accountId },
      );

      await request(app).get('/auth/me').set('Authorization', `Bearer ${expired}`).expect(401);
    });

    it('rejects an unsigned token (alg: none)', async () => {
      const admin = await signUpAdmin(app, 'Empresa None');
      const unsigned = jwt.sign({ cid: admin.companyId, role: 'admin' }, '', { algorithm: 'none', subject: admin.accountId });

      await request(app).get('/auth/me').set('Authorization', `Bearer ${unsigned}`).expect(401);
    });

    it('rejects a token signed with another secret', async () => {
      const admin = await signUpAdmin(app, 'Empresa Secret');
      const foreign = jwt.sign(
        { cid: admin.companyId, role: 'admin' },
        'another-secret-with-at-least-32-characters!!',
        { subject: admin.accountId },
      );

      await request(app).get('/auth/me').set('Authorization', `Bearer ${foreign}`).expect(401);
    });
  });
});
