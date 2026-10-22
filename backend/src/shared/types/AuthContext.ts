export const ROLES = ['admin', 'user'] as const;

export type TRole = (typeof ROLES)[number];

export type AuthContext = {
  accountId: string;
  companyId: string;
  role: TRole;
};
