import { TireType, RimType, TireCondition } from '@prisma/client';

export class CreateCategoryDto {
  name!: string;
  tireSize!: string; // e.g., "6.00-9", "7.00-12"
  brand!: string; // e.g., "Bridgestone", "Michelin"
  tireType!: TireType;
  rimType!: RimType;
  origin!: string; // Xuất xứ
  condition!: TireCondition;
  specifications?: string;
}
