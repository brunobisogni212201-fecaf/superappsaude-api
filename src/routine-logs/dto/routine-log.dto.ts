import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID } from 'class-validator';

export class CreateRoutineLogDto {
  @IsUUID()
  planId: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
