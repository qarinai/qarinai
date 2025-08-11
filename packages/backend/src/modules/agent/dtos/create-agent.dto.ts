import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAgentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identityMessage: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  systemMessage: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  defaultModelId: string;

  @ApiPropertyOptional()
  @IsUUID('4', { each: true })
  @IsOptional()
  allowedModelIds: string[];

  @ApiPropertyOptional()
  @IsUUID('4', { each: true })
  @IsOptional()
  linkedMcpServerIds: string[];

  // TODO: add metadata & RAG connections
}
