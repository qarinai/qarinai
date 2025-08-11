import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateVectorStoreDto {
  @ApiProperty()
  @IsString()
  name: string;

  @IsString()
  @ApiProperty()
  summary: string;
}
