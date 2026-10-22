import { TRole } from '@shared/types/AuthContext';

export class Account {
  readonly id: string;

  readonly companyId: string;

  readonly name: string;

  readonly email: string;

  readonly passwordHash: string;

  readonly role: TRole;

  readonly createdAt: Date;

  constructor(attr: Account.Attributes) {
    this.id = attr.id;
    this.companyId = attr.companyId;
    this.name = attr.name;
    this.email = attr.email;
    this.passwordHash = attr.passwordHash;
    this.role = attr.role;
    this.createdAt = attr.createdAt;
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  toPublic(): Account.Public {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
    };
  }
}

export namespace Account {
  export type Attributes = {
    id: string;
    companyId: string;
    name: string;
    email: string;
    passwordHash: string;
    role: TRole;
    createdAt: Date;
  };

  export type Public = {
    id: string;
    name: string;
    email: string;
    role: TRole;
  };
}
