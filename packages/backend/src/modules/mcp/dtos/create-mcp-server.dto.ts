import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IMcpServerSecurity } from '../interfaces/server-security.interface';
import { McpAdapterServerType } from '../enums/mcp-adapter-server-types.enum';
import { McpToolTypes } from '../enums/mcp-tool-types.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { McpDataDefinition } from '../interfaces/mcp.interfaces';

export class CreateMcpServerToolDataDto {
  url: string;
  method: string;
  headers: any;
  pathParams: any;
  queryParams: any;
  body: any;
  response_type: string;
}

export class CreateMcpServerToolDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(McpToolTypes)
  type: McpToolTypes = McpToolTypes.RestApiCall;

  @IsObject()
  data: McpDataDefinition;
}

export class CreateMcpServerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    type: 'string',
    enum: Object.values(McpAdapterServerType),
    default: McpAdapterServerType.Swagger,
  })
  @IsOptional()
  @IsEnum(McpAdapterServerType)
  type: McpAdapterServerType = McpAdapterServerType.Swagger;

  @IsObject()
  @IsNotEmpty()
  security: IMcpServerSecurity;

  @Type(() => CreateMcpServerToolDto)
  @ValidateNested({ each: true })
  tools: CreateMcpServerToolDto[];
}
