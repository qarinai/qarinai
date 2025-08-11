import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateVectorStoreSourceDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  fileId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  storeId: string;
}
