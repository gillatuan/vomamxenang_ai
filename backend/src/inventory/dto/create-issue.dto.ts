export class CreateIssueItemDto {
  productId?: string;
  wheelRimId?: string;
  quantity!: number;
  locationId?: string;
  notes?: string;
}

export class CreateIssueDto {
  clientId?: string;
  reason?: string;
  notes?: string;
  items!: CreateIssueItemDto[];
}
