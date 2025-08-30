export enum SettingKey {
  DefaultLlmProvider = 'default_llm_provider',
  DefaultChatModel = 'default_chat_model',
  DefaultEmbeddingModel = 'default_embedding_model'
}

export interface ISetting {
  id: string;
  name: string;
  value: string;
  key: SettingKey;
}
