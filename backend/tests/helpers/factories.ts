import { randomUUID } from 'node:crypto';

import { Express } from 'express';
import request from 'supertest';

export const PASSWORD = 'Senha@123';

export type TestSession = {
  token: string;
  accountId: string;
  companyId: string;
  inviteCode: string;
};

export function uniqueEmail(prefix = 'user'): string {
  return `${prefix}-${randomUUID().slice(0, 8)}@test.com`;
}

export async function signUpAdmin(app: Express, companyName: string): Promise<TestSession> {
  const response = await request(app)
    .post('/auth/sign-up')
    .send({ name: 'Admin Teste', email: uniqueEmail('admin'), password: PASSWORD, companyName })
    .expect(201);

  const me = await request(app).get('/auth/me').set('Authorization', `Bearer ${response.body.accessToken}`).expect(200);

  return {
    token: response.body.accessToken,
    accountId: response.body.account.id,
    companyId: response.body.company.id,
    inviteCode: me.body.company.inviteCode,
  };
}

export async function signUpUser(app: Express, inviteCode: string): Promise<TestSession> {
  const response = await request(app)
    .post('/auth/sign-up')
    .send({ name: 'Usuário Teste', email: uniqueEmail('user'), password: PASSWORD, inviteCode })
    .expect(201);

  return {
    token: response.body.accessToken,
    accountId: response.body.account.id,
    companyId: response.body.company.id,
    inviteCode,
  };
}

export async function createProduct(
  app: Express,
  session: TestSession,
  overrides: Partial<{ name: string; description: string; priceInCents: number; category: string }> = {},
) {
  const response = await request(app)
    .post('/products')
    .set('Authorization', `Bearer ${session.token}`)
    .send({
      name: 'Produto Teste',
      description: 'Descrição do produto de teste.',
      priceInCents: 1990,
      category: 'Geral',
      ...overrides,
    })
    .expect(201);

  return response.body as { id: string; name: string; category: string; priceInCents: number };
}

export function bearer(session: TestSession): [string, string] {
  return ['Authorization', `Bearer ${session.token}`];
}
