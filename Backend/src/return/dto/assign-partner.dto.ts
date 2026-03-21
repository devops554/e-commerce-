import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignPartnerDto {
  @IsMongoId()
  @IsNotEmpty()
  deliveryPartnerId: string;
}
