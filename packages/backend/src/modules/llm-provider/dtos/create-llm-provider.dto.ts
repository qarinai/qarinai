import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateLlmProviderDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUrl()
  apiBaseUrl: string;

  @IsNotEmpty()
  apiKey: string;

  @IsNotEmpty()
  @IsString({ each: true })
  models: string[];
}
