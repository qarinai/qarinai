export interface IDashboardStats {
  agents: number;
  chatProviders: number;
  vectorStores: number;
  mcpServers: number;
}

export type IDashboardChartData = Array<{
  day: string;
  messages: number;
  conversations: number;
  tokens: number;
}>;
