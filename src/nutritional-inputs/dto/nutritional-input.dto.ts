import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateNutritionalInputDto {
  @IsString()
  mealType: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  calories?: number;
}
