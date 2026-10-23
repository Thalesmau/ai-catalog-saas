import { EmailAlreadyInUse } from '@application/errors/application/EmailAlreadyInUse';
import { ErrorCode } from '@application/errors/ErrorCode';
import { BadRequest } from '@application/errors/http/BadRequest';
import { AuthTokenService } from '@application/gateways/AuthTokenService';
import { PasswordHasher } from '@application/gateways/PasswordHasher';
import { AccountRepository } from '@infra/database/repositories/AccountRepository';
import { CompanyRepository } from '@infra/database/repositories/CompanyRepository';
import { Injectable } from '@kernel/decorators/Injectable';
import { randomCode } from '@shared/utils/randomCode';
import { slugify } from '@shared/utils/slugify';

import { AuthSession } from './AuthSession';

const MAX_UNIQUE_ATTEMPTS = 5;

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(input: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
    const existing = await this.accountRepository.findByEmail(input.email);

    if (existing) {
      throw new EmailAlreadyInUse();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const { account, company } = 'companyName' in input
      ? await this.createCompanyWithAdmin(input.companyName, { ...input, passwordHash })
      : await this.joinCompany(input.inviteCode, { ...input, passwordHash });

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

  private async createCompanyWithAdmin(companyName: string, data: SignUpUseCase.AccountData) {
    const company = await this.companyRepository.create({
      name: companyName,
      slug: await this.generateUniqueSlug(companyName),
      inviteCode: await this.generateUniqueInviteCode(),
    });

    try {
      const account = await this.accountRepository.create({
        companyId: company.id,
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: 'admin',
      });

      return { account, company };
    } catch (error) {
      await this.companyRepository.delete(company.id);
      throw error;
    }
  }

  private async joinCompany(inviteCode: string, data: SignUpUseCase.AccountData) {
    const company = await this.companyRepository.findByInviteCode(inviteCode);

    if (!company) {
      throw new BadRequest('Código de convite inválido.', ErrorCode.INVALID_INVITE_CODE);
    }

    const account = await this.accountRepository.create({
      companyId: company.id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: 'user',
    });

    return { account, company };
  }

  private async generateUniqueSlug(companyName: string): Promise<string> {
    const base = slugify(companyName) || 'empresa';

    for (let attempt = 0; attempt < MAX_UNIQUE_ATTEMPTS; attempt++) {
      const slug = attempt === 0 ? base : `${base}-${randomCode(4).toLowerCase()}`;

      if (!(await this.companyRepository.existsBySlug(slug))) {
        return slug;
      }
    }

    throw new Error('Could not generate a unique company slug.');
  }

  private async generateUniqueInviteCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_UNIQUE_ATTEMPTS; attempt++) {
      const code = randomCode(8);

      if (!(await this.companyRepository.existsByInviteCode(code))) {
        return code;
      }
    }

    throw new Error('Could not generate a unique invite code.');
  }
}

export namespace SignUpUseCase {
  type BaseInput = {
    name: string;
    email: string;
    password: string;
  };

  export type Input =
    | (BaseInput & { companyName: string })
    | (BaseInput & { inviteCode: string });

  export type AccountData = {
    name: string;
    email: string;
    passwordHash: string;
  };

  export type Output = AuthSession;
}
