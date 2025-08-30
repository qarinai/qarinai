export interface IDashboardStats {
  agents: number;
  llmProviders: number;
  vectorStores: number;
  mcpServers: number;
}

export type IDashboardChartData = Array<{
  day: string;
  messages: number;
  conversations: number;
  tokens: number;
}>;
