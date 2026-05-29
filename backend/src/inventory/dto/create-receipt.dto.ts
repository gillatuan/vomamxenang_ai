export class CreateReceiptItemDto {
  productId?: string;
  wheelRimId?: string;
  quantity!: number;
  unitPrice!: number;
  locationId?: string;
  notes?: string;
}

export class CreateReceiptDto {
  supplierId!: string;
  notes?: string;
  items!: CreateReceiptItemDto[];
}
