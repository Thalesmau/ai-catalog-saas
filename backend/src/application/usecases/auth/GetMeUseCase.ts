import { Account } from '@application/entities/Account';
import { Unauthorized } from '@application/errors/http/Unauthorized';
import { AccountRepository } from '@infra/database/repositories/AccountRepository';
import { CompanyRepository } from '@infra/database/repositories/CompanyRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class GetMeUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute({ companyId, accountId }: GetMeUseCase.Input): Promise<GetMeUseCase.Output> {
    const [account, company] = await Promise.all([
      this.accountRepository.findById(companyId, accountId),
      this.companyRepository.findById(companyId),
    ]);

    if (!account || !company) {
      throw new Unauthorized();
    }

    return {
      account: account.toPublic(),
      company: {
        id: company.id,
        name: company.name,
        inviteCode: account.isAdmin() ? company.inviteCode : null,
      },
    };
  }
}

export namespace GetMeUseCase {
  export type Input = {
    companyId: string;
    accountId: string;
  };

  export type Output = {
    account: Account.Public;
    company: {
      id: string;
      name: string;
      inviteCode: string | null;
    };
  };
}
