import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsUUID()
  patientId: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  clinicalNotes?: string;
}

export class UpdateMedicalRecordDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  clinicalNotes?: string;
}
