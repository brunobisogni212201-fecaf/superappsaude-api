import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvConfig {
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  @IsNotEmpty()
  PORT: string = '3000';

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_PROJECT_ID: string = 'saude-app-cd93e';

  @IsString()
  @IsOptional()
  WEB_URL?: string;

  @IsString()
  @IsOptional()
  API_URL?: string;

  @IsString()
  @IsOptional()
  GOOGLE_APPLICATION_CREDENTIALS?: string;
}
