import { IAgentTool } from '@application/ai/AgentTool';

export abstract class LlmGateway {
  abstract runAgent(params: LlmGateway.RunAgentParams): Promise<LlmGateway.RunAgentResult>;
}

export namespace LlmGateway {
  export type Message = {
    role: 'user' | 'assistant';
    content: string;
  };

  export type AgentEvent =
    | { type: 'text'; delta: string }
    | { type: 'tool_call'; id: string; name: string; input: unknown }
    | { type: 'tool_result'; id: string; name: string; output: unknown; isError: boolean }
    | { type: 'done' }
    | { type: 'error'; code: string; message: string };

  export type RunAgentParams = {
    system: string;
    messages: Message[];
    tools: IAgentTool[];
    onEvent: (event: AgentEvent) => void;
    signal?: AbortSignal;
  };

  export type RunAgentResult = {
    text: string;
  };
}
