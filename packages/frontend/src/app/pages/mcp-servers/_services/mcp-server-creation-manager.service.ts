import { Injectable } from '@angular/core';
import { IEndpoint } from '../_interfaces/endpoint.interface';
import { OpenApi } from 'openapi-v3';
import _ from 'lodash';

@Injectable()
export class McpServerCreationManagerService {
  private _swaggerContent: OpenApi | null = null;
  private _selectedEndpointIds: string[] = [];
  private _serverName: string = '';
  private _serverDescription: string = '';
  private _serverUrl: string = '';
  private _security: any = null; // Placeholder for security configuration
  private _updatedEndpoints: IEndpoint[] = [];

  initializeCreation() {
    this._swaggerContent = null;
    this._selectedEndpointIds = [];
    this._serverName = '';
    this._serverDescription = '';
  }

  setSwaggerContent(content: any) {
    this._swaggerContent = content;
    this._serverName = content.info?.title || '';
    this._serverDescription = content.info?.description || '';
    this._serverUrl = content.servers?.[0]?.url || '';
  }

  setSelectedEndpointIds(ids: string[]) {
    this._selectedEndpointIds = [...ids];
  }

  getSelectedEndpointIds(): string[] {
    return this._selectedEndpointIds;
  }

  getAllEndpoints(): IEndpoint[] {
    if (!this._swaggerContent) {
      throw new Error('Swagger content is not set. Please set it before retrieving endpoints.');
    }

    const endpoints: IEndpoint[] = [];

    for (const [path, methods] of Object.entries(this._swaggerContent.paths)) {
      for (const [method, details] of Object.entries(methods)) {
        const endpoint: IEndpoint = {
          id: _.snakeCase(details.operationId || method + path),
          path,
          method: method.toUpperCase(),
          details,
          description: details.description || details.summary || ''
        };
        endpoints.push(endpoint);
      }
    }

    return endpoints;
  }

  getSelectedEndpointsWithDetails(): IEndpoint[] {
    const endpoints = this.getAllEndpoints();
    const filteredEndpoints = endpoints
      .filter((endpoint) => this._selectedEndpointIds.includes(endpoint.id))
      .map((endpoint) => {
        endpoint.path = this._serverUrl + endpoint.path;

        const pathParamsList = endpoint.details.parameters?.filter((param: any) => param.in === 'path') || [];
        const queryParamsList = endpoint.details.parameters?.filter((param: any) => param.in === 'query') || [];

        const pathParams = _(pathParamsList)
          .keyBy('name')
          .mapValues((param) => ({
            description: param.description || '',
            required: param.required || false,
            type: param.schema?.type || 'string',
            enum: param.schema?.enum || undefined,
            default: param.schema?.default || undefined
          }))
          .value();

        const queryParams = _(queryParamsList)
          .keyBy('name')
          .mapValues((param) => ({
            description: param.description || '',
            required: param.required || false,
            type: param.schema?.type || 'string',
            enum: param.schema?.enum || undefined,
            default: param.schema?.default || undefined
          }))
          .value();

        let bodySchema = endpoint.details.requestBody?.content?.['application/json']?.schema;

        let bodyParams = {};
        if (bodySchema) {
          if (bodySchema.$ref) {
            const refPath = bodySchema.$ref.split('/').slice(1).join('.');

            bodySchema = _.get(this._swaggerContent, refPath);

            bodyParams = this.flatten(this.removeProperties(bodySchema));
          }
        }

        endpoint.toolData = {
          response_type: 'json',
          pathParams,
          queryParams,
          bodyParams,
          headerParams: {}
        };

        return endpoint;
      });

    return filteredEndpoints;
  }

  getAllServers() {
    if (!this._swaggerContent) {
      throw new Error('Swagger content is not set. Please set it before retrieving servers.');
    }

    const servers = this._swaggerContent.servers || [];

    return servers;
  }

  getServerName() {
    return this._serverName;
  }

  setServerName(name: string) {
    this._serverName = name;
  }

  getServerDescription() {
    return this._serverDescription || '';
  }

  setServerDescription(description: string) {
    this._serverDescription = description;
  }

  getServerUrl() {
    return this._serverUrl;
  }

  setServerUrl(url: string) {
    this._serverUrl = url;
  }

  setSecurity(security: any) {
    this._security = security;
  }

  setUpdatedEndpoints(endpoints: IEndpoint[]) {
    this._updatedEndpoints = [...endpoints];
  }

  getFinalizedServerData() {
    if (!this._swaggerContent) {
      throw new Error('Swagger content is not set. Please set it before retrieving server data.');
    }

    const endpoints = this.getSelectedEndpointsWithDetails();
    const serverData: any = {
      name: this._serverName,
      description: this._serverDescription,
      security: this._security,
      tools: endpoints.map((endpoint) => ({
        name: endpoint.id,
        description: endpoint.description,
        data: {
          url: endpoint.path,
          method: endpoint.method.toUpperCase(),
          headers: endpoint.toolData?.headerParams || {},
          pathParams: endpoint.toolData?.pathParams || {},
          queryParams: endpoint.toolData?.queryParams || {},
          body: endpoint.toolData?.bodyParams || {},
          response_type: endpoint.toolData?.response_type || 'json'
        }
      }))
    };

    return serverData;
  }

  private removeProperties(obj: any) {
    if (obj?.type === 'object' && obj?.properties) {
      const newObj = {
        ...obj.properties
      };

      for (const key of Object.keys(newObj)) {
        newObj[key] = this.removeProperties(newObj[key]);
      }

      return newObj;
    }

    return obj;
  }

  private flatten(x: any, path: string[] = []): any {
    return _.chain(x)
      .toPairs()
      .reduce((acc: any, [key, value]: [string, any]) => {
        const joinPath = [...path, key].join('.');
        if ((value?.type && value.type !== 'object') || _.isArray(value?.oneOf)) {
          return { ...acc, [joinPath]: value };
        } else {
          return { ...acc, ...this.flatten(value, [...path, key]) };
        }
      }, {} as any)
      .value();
  }
}
