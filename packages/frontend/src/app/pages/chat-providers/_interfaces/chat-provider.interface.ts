export interface IChatProviderModel {
  id: string;
  name: string;
}

export interface IChatProviderOriginalModel {
  id: string;
}

export interface IChatProvider {
  id: string;
  name: string;
  protocol: 'openai';
  apiBaseUrl: string;
  apiKey: string;
  models: IChatProviderModel[];
}
