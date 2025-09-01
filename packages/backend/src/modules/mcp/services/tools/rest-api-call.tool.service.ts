import { Inject, Injectable } from '@nestjs/common';
import { IToolService } from '../../interfaces/tool-service.interface';
import { ToolRestApiCallDataDefinition } from '../../interfaces/mcp.interfaces';
import axios, { type AxiosRequestConfig } from 'axios';
import { IMcpServerSecurity } from '../../interfaces/server-security.interface';
import { SecureKeyService } from 'src/modules/secure-keys/services/secure-key.service';
import { isUUID } from 'class-validator';
import { paramTypeToZodType } from '../../utils';
import { z, ZodString } from 'zod';
import { McpAdapterTool } from '../../entities/mcp-adapter-tool.entity';

@Injectable()
export class RestApiCallToolService implements IToolService {
  @Inject()
  private readonly secureKeyService: SecureKeyService;

  async executeTool(
    toolEntity: McpAdapterTool,
    callParams: Record<string, any>,
    security?: IMcpServerSecurity,
  ): Promise<any> {
    const toolData = toolEntity.toolData as ToolRestApiCallDataDefinition;
    const {
      url,
      method,
      headers,
      pathParams,
      queryParams,
      body,
      response_type,
    } = toolData;

    const client = axios.create({});

    const clientConfig: AxiosRequestConfig = {
      url: '',
      method: method.toLowerCase(),
    };

    let fullUrl = url;
    // Replace path parameters

    if (pathParams && Object.keys(pathParams).length > 0) {
      for (const [paramName] of Object.entries(pathParams)) {
        if (
          paramName &&
          url.includes(`{${paramName}}`) &&
          callParams[paramName]
        ) {
          fullUrl = fullUrl.replace(
            `{${paramName}}`,
            callParams[paramName] as string,
          );
        }
      }
    }

    if (queryParams && Object.keys(queryParams).length > 0) {
      const queryString = Object.entries(queryParams)
        .map(([key, value]) => {
          if (value.required && !callParams[key]) {
            throw new Error(`Missing required query parameter: ${key}`);
          }
          return callParams[key]
            ? `${key}=${encodeURIComponent((callParams[key] as string) || '')}`
            : undefined;
        })
        .filter((param) => param !== undefined)
        .join('&');
      fullUrl += `?${queryString}`;
    }

    clientConfig.url = fullUrl;

    if (headers && Object.keys(headers).length > 0) {
      // Add headers to the request
      // Note: This is a placeholder, actual implementation will depend on the HTTP client used
      clientConfig.headers = {};
      for (const [headerName, headerDetails] of Object.entries(headers)) {
        if (headerDetails.required && !callParams[headerName]) {
          throw new Error(`Missing required header: ${headerName}`);
        }
        clientConfig.headers[headerName] =
          callParams[headerName] || headerDetails.default;
      }
    }

    if (body && Object.keys(body).length > 0) {
      // Add body to the request
      // Note: This is a placeholder, actual implementation will depend on the HTTP client used
      clientConfig.data = {};
      for (const [bodyParamName, bodyParamDetails] of Object.entries(body)) {
        if (bodyParamDetails.required && !callParams[bodyParamName]) {
          throw new Error(`Missing required body parameter: ${bodyParamName}`);
        }
        clientConfig.data[bodyParamName] =
          callParams[bodyParamName] || bodyParamDetails.default;
      }
    }

    // check if security is provided and set up authentication
    if (security) {
      if (security.isSecure) {
        if (security.securityType === 'basic') {
          const credentials =
            security.value.type === 'static'
              ? security.value.credentials
              : {
                  username:
                    callParams[security.value.fromToolParameters.username.name],
                  password:
                    callParams[security.value.fromToolParameters.password.name],
                };
          clientConfig.auth = {
            username: await this.getSecureValueAttempt(
              credentials.username as string,
            ),
            password: await this.getSecureValueAttempt(
              credentials.password as string,
            ),
          };
        } else if (security.securityType === 'bearer') {
          const token =
            security.value.type === 'static'
              ? security.value.token
              : callParams[security.value.fromToolParameters.token.name];
          const decryptedToken = await this.getSecureValueAttempt(
            token as string,
          );
          clientConfig.headers = {
            ...clientConfig.headers,
            Authorization: `Bearer ${decryptedToken}`,
          };
        } else if (security.securityType === 'apiKey') {
          const apiKey =
            security.value.type === 'static'
              ? security.value.apiKey
              : (callParams[
                  security.value.fromToolParameters.apiKey.name
                ] as string);
          const decryptedApiKey = await this.getSecureValueAttempt(apiKey);
          if (security.authParamIn === 'header') {
            clientConfig.headers = {
              ...clientConfig.headers,
              [security.authParamName]: decryptedApiKey,
            };
          } else if (security.authParamIn === 'query') {
            const separator = clientConfig.url.includes('?') ? '&' : '?';
            clientConfig.url += `${separator}${security.authParamName}=${encodeURIComponent(
              decryptedApiKey,
            )}`;
          } else if (security.authParamIn === 'cookie') {
            const existingCookie =
              clientConfig.headers?.['Cookie'] ||
              clientConfig.headers?.['cookie'] ||
              '';
            const cookieString = `${security.authParamName}=${decryptedApiKey}`;
            clientConfig.headers = {
              ...clientConfig.headers,
              Cookie: existingCookie
                ? `${existingCookie}; ${cookieString}`
                : cookieString,
            };
          }
        }
      }
    }

    console.log('api security:', security);
    console.log('Making API call with config:', clientConfig);

    clientConfig.responseType = response_type;

    try {
      const response = await client.request(clientConfig);
      console.log('API call successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error calling external API:', error);
      throw new Error(
        `Failed to call external API: ${error.message} ${JSON.stringify(error?.response?.data ?? {})}`,
      );
    }
  }

  buildToolInputSchema(
    toolEntity: McpAdapterTool,
    security?: IMcpServerSecurity,
  ) {
    const toolSchema: Record<string, any> = {};

    const toolData = toolEntity.toolData as ToolRestApiCallDataDefinition;

    if (toolData.pathParams && Object.keys(toolData.pathParams).length > 0) {
      for (const [paramName, paramInfo] of Object.entries(
        toolData.pathParams,
      )) {
        let zodType: any = z;
        try {
          zodType =
            zodType[paramTypeToZodType(paramInfo.type)](paramInfo?.enum) ||
            zodType.string();
        } catch (error) {
          console.error(
            `1:: Error creating Zod type for param ${paramName}: ${JSON.stringify(paramInfo)}`,
            error,
          );
          throw error;
        }
        if (!paramInfo.required) {
          zodType = (zodType as ZodString).optional();
        }
        toolSchema[paramName] = zodType;
      }
    }

    if (toolData.queryParams && Object.keys(toolData.queryParams).length > 0) {
      for (const [paramName, paramInfo] of Object.entries(
        toolData.queryParams,
      )) {
        let zodType: any = z;
        try {
          zodType =
            zodType[paramTypeToZodType(paramInfo.type)]() || zodType.string();
        } catch (error) {
          console.error(
            `2:: Error creating Zod type for param ${paramName}: ${JSON.stringify(paramInfo)}`,
            error,
          );
          throw error;
        }
        if (!paramInfo.required) {
          zodType = (zodType as ZodString).optional();
        }
        toolSchema[paramName] = zodType;
      }
    }
    if (toolData.body && Object.keys(toolData.body).length > 0) {
      for (const [paramName, paramInfo] of Object.entries(toolData.body)) {
        let zodType: any = z;
        try {
          zodType =
            zodType[paramTypeToZodType(paramInfo.type)]() || zodType.string();
        } catch (error) {
          console.error(
            `3:: Error creating Zod type for param ${paramName}: ${JSON.stringify(paramInfo)}`,
            error,
          );
          throw error;
        }
        if (!paramInfo.required) {
          zodType = (zodType as ZodString).optional();
        }
        toolSchema[paramName] = zodType;
      }
    }

    if (security && security.isSecure && security.value.type === 'dynamic') {
      if (security.securityType === 'basic') {
        toolSchema[security.value.fromToolParameters.username.name] =
          z.string();
        toolSchema[security.value.fromToolParameters.password.name] =
          z.string();
      } else if (security.securityType === 'bearer') {
        toolSchema[security.value.fromToolParameters.token.name] = z.string();
      }
    }

    return toolSchema;
  }

  private async getSecureValueAttempt(value: string) {
    if (isUUID(value)) {
      return this.secureKeyService.getDecryptedKeyById(value);
    }

    return value;
  }
}
