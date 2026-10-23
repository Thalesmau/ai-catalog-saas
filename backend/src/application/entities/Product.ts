export class Product {
  readonly id: string;

  readonly companyId: string;

  readonly name: string;

  readonly description: string;

  readonly priceInCents: number;

  readonly category: string;

  readonly imageUrl: string | null;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  constructor(attr: Product.Attributes) {
    this.id = attr.id;
    this.companyId = attr.companyId;
    this.name = attr.name;
    this.description = attr.description;
    this.priceInCents = attr.priceInCents;
    this.category = attr.category;
    this.imageUrl = attr.imageUrl ?? null;
    this.createdAt = attr.createdAt;
    this.updatedAt = attr.updatedAt;
  }

  toPublic(): Product.Public {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      priceInCents: this.priceInCents,
      category: this.category,
      imageUrl: this.imageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export namespace Product {
  export type Attributes = {
    id: string;
    companyId: string;
    name: string;
    description: string;
    priceInCents: number;
    category: string;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

  export type Public = Omit<Attributes, 'companyId' | 'imageUrl'> & {
    imageUrl: string | null;
  };
}
