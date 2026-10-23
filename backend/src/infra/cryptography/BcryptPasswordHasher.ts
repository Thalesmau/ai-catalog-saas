import bcrypt from 'bcryptjs';

import { PasswordHasher } from '@application/gateways/PasswordHasher';
import { Injectable } from '@kernel/decorators/Injectable';

const SALT_ROUNDS = 10;

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
