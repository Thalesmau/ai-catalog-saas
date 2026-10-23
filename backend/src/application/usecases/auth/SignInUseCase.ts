import { ErrorCode } from '@application/errors/ErrorCode';
import { Unauthorized } from '@application/errors/http/Unauthorized';
import { AuthTokenService } from '@application/gateways/AuthTokenService';
import { PasswordHasher } from '@application/gateways/PasswordHasher';
import { AccountRepository } from '@infra/database/repositories/AccountRepository';
import { CompanyRepository } from '@infra/database/repositories/CompanyRepository';
import { Injectable } from '@kernel/decorators/Injectable';

import { AuthSession } from './AuthSession';

@Injectable()
export class SignInUseCase {
  private static dummyHash: Promise<string> | undefined;

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute({ email, password }: SignInUseCase.Input): Promise<SignInUseCase.Output> {
    const account = await this.accountRepository.findByEmail(email);

    const hash = account?.passwordHash ?? await this.getDummyHash();
    const passwordMatches = await this.passwordHasher.compare(password, hash);

    if (!account || !passwordMatches) {
      throw new Unauthorized(ErrorCode.INVALID_CREDENTIALS, 'Email ou senha inválidos.');
    }

    const company = await this.companyRepository.findById(account.companyId);

    if (!company) {
      throw new Unauthorized(ErrorCode.INVALID_CREDENTIALS, 'Email ou senha inválidos.');
    }

    const accessToken = this.authTokenService.sign({
      accountId: account.id,
      companyId: company.id,
      role: account.role,
    });

    return {
      accessToken,
      account: account.toPublic(),
      company: { id: company.id, name: company.name },
    };
  }

  private getDummyHash(): Promise<string> {
    SignInUseCase.dummyHash ??= this.passwordHasher.hash('dummy-password-for-timing');

    return SignInUseCase.dummyHash;
  }
}

export namespace SignInUseCase {
  export type Input = {
    email: string;
    password: string;
  };

  export type Output = AuthSession;
}
