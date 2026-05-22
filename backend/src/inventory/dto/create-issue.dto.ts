export class CreateIssueItemDto {
  categoryId!: string;
  quantity!: number;
  slotId?: string;
  notes?: string;
}

export class CreateIssueDto {
  clientId?: string;
  reason?: string;
  notes?: string;
  items!: CreateIssueItemDto[];
}
