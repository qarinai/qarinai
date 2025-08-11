import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendMessageParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  agentId: string;
}

export class SendMessageBodyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;
}
