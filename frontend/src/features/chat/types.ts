export type ChatEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool_call'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; id: string; name: string; output: unknown; isError: boolean }
  | { type: 'done' }
  | { type: 'error'; code: string; message: string };

export type ToolCall = {
  id: string;
  name: string;
  input: Record<string, unknown>;
  status: 'running' | 'done' | 'error';
  output?: unknown;
};

export type ChatProduct = {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  imageUrl: string | null;
};

export type ChatMessage =
  | { id: string; role: 'user'; content: string }
  | {
    id: string;
    role: 'assistant';
    content: string;
    toolCalls: ToolCall[];
    status: 'streaming' | 'done' | 'error' | 'stopped';
    error?: string;
  };

export type AssistantMessage = Extract<ChatMessage, { role: 'assistant' }>;
