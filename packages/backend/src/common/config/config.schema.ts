import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ConfigSchema {
  @IsNotEmpty()
  @IsString()
  DB_HOST: string;

  @IsNotEmpty()
  @IsNumber()
  DB_PORT: number;

  @IsNotEmpty()
  @IsString()
  DB_USER: string;

  @IsNotEmpty()
  @IsString()
  DB_PASS: string;

  @IsNotEmpty()
  @IsString()
  DB_NAME: string;

  @IsOptional()
  @IsBoolean()
  DB_LOGGING: boolean;

  @IsOptional()
  @IsNumber()
  PORT: number;

  @IsNotEmpty()
  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_ACCESS_TOKEN_EXPIRATION: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_TOKEN_EXPIRATION: string;

  @IsNotEmpty()
  @IsString()
  DEFAULT_ADMIN_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  SECURE_KEY_PASSPHRASE: string;
}
