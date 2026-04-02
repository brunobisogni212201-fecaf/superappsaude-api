import { IsString, IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { PlanType } from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  target?: number;

  @IsString()
  @IsOptional()
  targetUnit?: string;

  @IsEnum(PlanType)
  type: PlanType;

  @IsUUID()
  patientId: string;
}

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  target?: number;

  @IsString()
  @IsOptional()
  targetUnit?: string;

  @IsEnum(PlanType)
  @IsOptional()
  type?: PlanType;
}
