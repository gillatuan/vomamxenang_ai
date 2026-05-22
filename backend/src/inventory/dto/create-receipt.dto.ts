export class CreateReceiptItemDto {
  categoryId!: string;
  quantity!: number;
  unitPrice!: number;
  slotId?: string;
  notes?: string;
}

export class CreateReceiptDto {
  supplierId!: string;
  notes?: string;
  items!: CreateReceiptItemDto[];
}
