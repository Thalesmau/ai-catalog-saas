import { Account } from '@application/entities/Account';

export type AuthSession = {
  accessToken: string;
  account: Account.Public;
  company: {
    id: string;
    name: string;
  };
};
