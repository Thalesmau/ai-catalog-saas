import {
  ApiError,
  Content,
  FunctionCall,
  FunctionCallingConfigMode,
  FunctionDeclaration,
  GenerateContentParameters,
  GoogleGenAI,
  Part,
} from '@google/genai';
import { z } from 'zod';

import { IAgentTool } from '@application/ai/AgentTool';
import { ErrorCode } from '@application/errors/ErrorCode';
import { ServiceUnavailable } from '@application/errors/http/ServiceUnavailable';
import { LlmGateway } from '@application/gateways/LlmGateway';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

const MAX_ITERATIONS = 5;

@Injectable()
export class GeminiLlmGateway extends LlmGateway {
  private client: GoogleGenAI | undefined;

  constructor(private readonly config: AppConfig) {
    super();
  }

  async runAgent({ system, messages, tools, onEvent, signal }: LlmGateway.RunAgentParams): Promise<LlmGateway.RunAgentResult> {
    const client = this.getClient();
    const functionDeclarations = tools.map(toFunctionDeclaration);

    const contents: Content[] = messages.map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

    const fallbackModels = [this.config.llm.model, this.config.llm.fallbackModel]
      .filter((model, index, models): model is string => Boolean(model) && models.indexOf(model) === index);

    let finalText = '';

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      let turn: GeminiLlmGateway.Turn | undefined;

      while (!turn) {
        const model = fallbackModels[0]!;
        let emittedText = false;

        try {
          turn = await this.streamTurn(client, {
            model,
            contents,
            config: {
              systemInstruction: system,
              tools: [{ functionDeclarations }],
              toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO } },
              abortSignal: signal,
            },
          }, (delta) => {
            emittedText = true;
            finalText += delta;
            onEvent({ type: 'text', delta });
          });
        } catch (error) {
          if (signal?.aborted) {
            throw error;
          }

          if (!emittedText && fallbackModels.length > 1 && isRetryable(error)) {
            fallbackModels.shift();
            continue;
          }

          throw toServiceError(error);
        }
      }

      const { modelParts, functionCalls } = turn;

      contents.push({ role: 'model', parts: modelParts });

      if (functionCalls.length === 0) {
        onEvent({ type: 'done' });
        return { text: finalText };
      }

      const responses = await Promise.all(functionCalls.map(call => this.executeTool(call, tools, onEvent)));
      contents.push({ role: 'user', parts: responses });
    }

    const fallback = 'Não consegui concluir a consulta. Tente reformular a pergunta.';
    onEvent({ type: 'text', delta: fallback });
    onEvent({ type: 'done' });

    return { text: finalText + fallback };
  }

  private async streamTurn(
    client: GoogleGenAI,
    params: GenerateContentParameters,
    onText: (delta: string) => void,
  ): Promise<GeminiLlmGateway.Turn> {
    const modelParts: Part[] = [];
    const functionCalls: FunctionCall[] = [];

    const stream = await client.models.generateContentStream(params);

    for await (const chunk of stream) {
      for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
        modelParts.push(part);

        if (part.functionCall) {
          functionCalls.push(part.functionCall);
        } else if (part.text && !part.thought) {
          onText(part.text);
        }
      }
    }

    return { modelParts, functionCalls };
  }

  private async executeTool(
    call: FunctionCall,
    tools: IAgentTool[],
    onEvent: LlmGateway.RunAgentParams['onEvent'],
  ): Promise<Part> {
    const id = call.id ?? `${call.name}-${Date.now()}`;
    const name = call.name ?? 'unknown';
    const tool = tools.find(t => t.name === name);

    onEvent({ type: 'tool_call', id, name, input: call.args ?? {} });

    const reply = (response: Record<string, unknown>, isError: boolean): Part => {
      onEvent({ type: 'tool_result', id, name, output: response, isError });
      return { functionResponse: { id: call.id, name, response } };
    };

    if (!tool) {
      return reply({ error: `Ferramenta "${name}" não existe.` }, true);
    }

    const parsed = tool.inputSchema.safeParse(call.args ?? {});

    if (!parsed.success) {
      return reply({ error: 'Argumentos inválidos.', issues: z.flattenError(parsed.error).fieldErrors }, true);
    }

    try {
      const output = await tool.run(parsed.data);
      return reply({ output }, false);
    } catch {
      return reply({ error: 'Falha ao consultar o catálogo.' }, true);
    }
  }

  private getClient(): GoogleGenAI {
    if (!this.config.llm.apiKey) {
      throw new ServiceUnavailable(ErrorCode.LLM_UNAVAILABLE, 'Agente de IA não configurado (GEMINI_API_KEY ausente).');
    }

    this.client ??= new GoogleGenAI({
      apiKey: this.config.llm.apiKey,
      httpOptions: {
        timeout: this.config.llm.timeoutMs,
        retryOptions: { attempts: 1 },
      },
    });

    return this.client;
  }
}

export namespace GeminiLlmGateway {
  export type Turn = {
    modelParts: Part[];
    functionCalls: FunctionCall[];
  };
}

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

function isRetryable(error: unknown): boolean {
  return error instanceof ApiError ? RETRYABLE_STATUS.has(error.status) : true;
}

function toFunctionDeclaration(tool: IAgentTool): FunctionDeclaration {
  const { $schema: _schema, ...parameters } = z.toJSONSchema(tool.inputSchema) as Record<string, unknown>;

  return {
    name: tool.name,
    description: tool.description,
    parametersJsonSchema: parameters,
  };
}

function toServiceError(error: unknown): ServiceUnavailable {
  const message = error instanceof ApiError && error.status === 429
    ? 'Limite de uso do agente de IA atingido. Tente novamente em instantes.'
    : 'O agente de IA está indisponível no momento.';

  const serviceError = new ServiceUnavailable(ErrorCode.LLM_UNAVAILABLE, message);
  serviceError.cause = error;

  return serviceError;
}
