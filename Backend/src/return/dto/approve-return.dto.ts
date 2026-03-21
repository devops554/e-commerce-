import { IsOptional, IsString } from 'class-validator';

export class ApproveReturnDto {
  @IsOptional() @IsString() adminNote?: string;
}
