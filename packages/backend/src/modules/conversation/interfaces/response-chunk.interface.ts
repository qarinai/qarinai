export interface IContentResponseChunk {
  // c stands for simple content
  c: string;
}

export interface IActiveToolCallChunk {
  // the status of a tool call
  tool_call: string;
}

export interface ITokensChunk {
  tokens: {
    completion: number;
    all: number;
  };
}

export interface IMessageInfoChunk {
  m: {
    messageId: string;
    conversationId: string;
  };
}

export type IResponseChunk =
  | IContentResponseChunk
  | IActiveToolCallChunk
  | ITokensChunk
  | IMessageInfoChunk;
