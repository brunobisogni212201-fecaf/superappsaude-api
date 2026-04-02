import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  idToken: string;

  @IsEnum(['web', 'mobile'])
  platform: 'web' | 'mobile';
}

export class RegisterDto {
  @IsString()
  idToken: string;

  @IsString()
  name: string;

  @IsEnum(['web', 'mobile'])
  platform: 'web' | 'mobile';
}

export class MagicLinkDto {
  @IsEmail()
  email: string;

  @IsEnum(['web', 'mobile'])
  platform: 'web' | 'mobile';
}
