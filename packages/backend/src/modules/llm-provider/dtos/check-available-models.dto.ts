import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CheckAvailableModelsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty()
  @IsUrl({
    require_tld: false,
  })
  @IsNotEmpty()
  apiBaseUrl: string;
}
