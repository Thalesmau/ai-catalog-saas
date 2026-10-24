import { http } from '@/lib/http';

export type Role = 'admin' | 'user';

export type Account = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Session = {
  account: Account;
  company: {
    id: string;
    name: string;
    inviteCode: string | null;
  };
};

type AuthResponse = {
  accessToken: string;
  account: Account;
  company: { id: string; name: string };
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
} & ({ companyName: string } | { inviteCode: string });

export const authApi = {
  signIn: (input: SignInInput) => http<AuthResponse>('/auth/sign-in', { method: 'POST', body: input }),
  signUp: (input: SignUpInput) => http<AuthResponse>('/auth/sign-up', { method: 'POST', body: input }),
  me: () => http<Session>('/auth/me'),
};
