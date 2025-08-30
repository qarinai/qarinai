export interface ILlmProviderModel {
  id: string;
  name: string;
}

export interface ILlmProviderOriginalModel {
  id: string;
}

export interface ILlmProvider {
  id: string;
  name: string;
  protocol: 'openai';
  apiBaseUrl: string;
  apiKey: string;
  models: ILlmProviderModel[];
}
