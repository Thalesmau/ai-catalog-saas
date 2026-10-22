export class Company {
  readonly id: string;

  readonly name: string;

  readonly slug: string;

  readonly inviteCode: string;

  readonly createdAt: Date;

  constructor(attr: Company.Attributes) {
    this.id = attr.id;
    this.name = attr.name;
    this.slug = attr.slug;
    this.inviteCode = attr.inviteCode;
    this.createdAt = attr.createdAt;
  }
}

export namespace Company {
  export type Attributes = {
    id: string;
    name: string;
    slug: string;
    inviteCode: string;
    createdAt: Date;
  };
}
