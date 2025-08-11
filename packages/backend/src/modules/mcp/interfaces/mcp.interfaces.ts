import { JSONSchema } from 'zod/v4/core/json-schema';
export interface ToolParameterDefinition {
  type: 'string' | 'number' | 'boolean';
  description: string;
  enum?: string[]; // Only for 'enum' type
  required?: boolean;
  default?: any;
}

export interface ToolRestApiCallDataDefinition {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers: Record<string, ToolParameterDefinition>;
  pathParams?: Record<string, ToolParameterDefinition>;
  queryParams?: Record<string, ToolParameterDefinition>;
  body?: Record<string, ToolParameterDefinition>;
  response_type: 'json' | 'text' | 'blob' | 'arraybuffer';
}

export interface ToolMcpProxyDataDefinition {
  url: string;
  inputSchema: JSONSchema;
}

export interface ToolVectorSearchDataDefinition {
  storeId: string;
}

export type McpDataDefinition =
  | ToolMcpProxyDataDefinition
  | ToolRestApiCallDataDefinition
  | ToolVectorSearchDataDefinition;
