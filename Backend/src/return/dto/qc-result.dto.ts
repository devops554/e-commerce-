import { IsEnum, IsOptional, IsString } from 'class-validator';
import { QcGrade } from '../../orders/schemas/return-enums';

export class QcResultDto {
  @IsEnum(QcGrade) qcGrade: QcGrade;
  @IsOptional() @IsString() qcNotes?: string;
}
