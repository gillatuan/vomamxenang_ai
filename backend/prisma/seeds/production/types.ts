export interface ProductionSeedDatabase {
  product: {
    upsert(args: unknown): Promise<unknown>;
  };
}

export interface ProductionSeed {
  key: string;
  name: string;
  preview: { productsToCreate: number };
  run(database: ProductionSeedDatabase): Promise<void>;
}
