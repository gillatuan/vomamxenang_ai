export interface ProductionSeedDatabase {
  backlinkOpportunity?: { upsert(args: unknown): Promise<unknown> };
  product: {
    createMany(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
    updateMany(args: unknown): Promise<unknown>;
    upsert(args: unknown): Promise<unknown>;
  };
  post: {
    upsert(args: unknown): Promise<unknown>;
  };
  storeInfo: {
    upsert(args: unknown): Promise<unknown>;
  };
}

export interface ProductionSeed {
  key: string;
  name: string;
  preview: { productsToCreate: number };
  run(database: ProductionSeedDatabase): Promise<void>;
}
