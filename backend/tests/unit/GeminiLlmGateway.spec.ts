import { ApiError, Part } from '@google/genai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { defineTool } from '@application/ai/AgentTool';
import { LlmGateway } from '@application/gateways/LlmGateway';
import { GeminiLlmGateway } from '@infra/gateways/GeminiLlmGateway';
import { AppConfig } from '@shared/config/AppConfig';

const { generateContentStream } = vi.hoisted(() => ({ generateContentStream: vi.fn() }));

vi.mock('@google/genai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@google/genai')>();

  return {
    ...actual,
    GoogleGenAI: class {
      models = { generateContentStream };
    },
  };
});

const PRIMARY = 'primary-model';
const FALLBACK = 'fallback-model';

function makeGateway(llm: Partial<AppConfig.Llm> = {}) {
  const config = { llm: { apiKey: 'test-key', model: PRIMARY, fallbackModel: FALLBACK, timeoutMs: 10_000, ...llm } };
  return new GeminiLlmGateway(config as AppConfig);
}

function streamOf(...parts: Part[]) {
  return (async function* () {
    for (const part of parts) {
      yield { candidates: [{ content: { role: 'model', parts: [part] } }] };
    }
  })();
}

describe('GeminiLlmGateway', () => {
  const searchRun = vi.fn(async (input: { query: string }) => ({ total: 1, products: [{ name: `${input.query} X` }] }));

  const tools = [
    defineTool({
      name: 'search_products',
      description: 'Busca produtos.',
      inputSchema: z.object({ query: z.string() }),
      run: searchRun,
    }),
  ];

  let events: LlmGateway.AgentEvent[];

  const runAgent = (gateway = makeGateway()) => gateway.runAgent({
    system: 'prompt',
    messages: [{ role: 'user', content: 'Tem fone?' }],
    tools,
    onEvent: event => events.push(event),
  });

  beforeEach(() => {
    generateContentStream.mockReset();
    searchRun.mockClear();
    events = [];
  });

  it('runs the requested tool and sends the result back to the model', async () => {
    const functionCallPart: Part = {
      functionCall: { id: 'call-1', name: 'search_products', args: { query: 'fone' } },
      thoughtSignature: 'signature-abc',
    };

    generateContentStream
      .mockResolvedValueOnce(streamOf(functionCallPart))
      .mockResolvedValueOnce(streamOf({ text: 'Temos o ' }, { text: 'fone X.' }));

    const result = await runAgent();

    expect(result.text).toBe('Temos o fone X.');
    expect(searchRun).toHaveBeenCalledWith({ query: 'fone' });
    expect(events.map(event => event.type)).toEqual(['tool_call', 'tool_result', 'text', 'text', 'done']);

    const { contents, config } = generateContentStream.mock.calls[1]![0];

    expect(config.systemInstruction).toBe('prompt');
    expect(contents[1]).toEqual({ role: 'model', parts: [functionCallPart] });
    expect(contents[2]).toEqual({
      role: 'user',
      parts: [{
        functionResponse: {
          id: 'call-1',
          name: 'search_products',
          response: { output: { total: 1, products: [{ name: 'fone X' }] } },
        },
      }],
    });
  });

  it('sends the tool declarations as JSON Schema', async () => {
    generateContentStream.mockResolvedValueOnce(streamOf({ text: 'Oi' }));

    await runAgent();

    const [declaration] = generateContentStream.mock.calls[0]![0].config.tools[0].functionDeclarations;

    expect(declaration).toMatchObject({
      name: 'search_products',
      parametersJsonSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    });
    expect(declaration.parametersJsonSchema).not.toHaveProperty('$schema');
  });

  it('returns invalid arguments to the model as a tool error without running the tool', async () => {
    generateContentStream
      .mockResolvedValueOnce(streamOf({ functionCall: { id: 'call-1', name: 'search_products', args: { query: 42 } } }))
      .mockResolvedValueOnce(streamOf({ text: 'Não consegui buscar.' }));

    await runAgent();

    expect(searchRun).not.toHaveBeenCalled();
    expect(events.find(event => event.type === 'tool_result')).toMatchObject({ isError: true });
  });

  it('reports an unknown tool as an error to the model', async () => {
    generateContentStream
      .mockResolvedValueOnce(streamOf({ functionCall: { id: 'call-1', name: 'drop_database', args: {} } }))
      .mockResolvedValueOnce(streamOf({ text: 'ok' }));

    await runAgent();

    expect(events.find(event => event.type === 'tool_result')).toMatchObject({
      name: 'drop_database',
      isError: true,
    });
  });

  it.each([429, 503])('switches to the fallback model when the primary answers %i', async (status) => {
    generateContentStream
      .mockRejectedValueOnce(new ApiError({ message: 'busy', status }))
      .mockResolvedValueOnce(streamOf({ text: 'Resposta do fallback.' }));

    const result = await runAgent();

    expect(result.text).toBe('Resposta do fallback.');
    expect(generateContentStream.mock.calls.map(([params]) => params.model)).toEqual([PRIMARY, FALLBACK]);
  });

  it('goes back to the primary model when the fallback fails in a later turn', async () => {
    generateContentStream
      .mockRejectedValueOnce(new ApiError({ message: 'busy', status: 503 }))
      .mockResolvedValueOnce(streamOf({ functionCall: { id: 'call-1', name: 'search_products', args: { query: 'fone' } } }))
      .mockRejectedValueOnce(new ApiError({ message: 'busy', status: 503 }))
      .mockResolvedValueOnce(streamOf({ text: 'Temos o fone X.' }));

    const result = await runAgent();

    expect(result.text).toBe('Temos o fone X.');
    expect(generateContentStream.mock.calls.map(([params]) => params.model)).toEqual([PRIMARY, FALLBACK, FALLBACK, PRIMARY]);
  });

  it('switches to the fallback model on network errors and timeouts', async () => {
    generateContentStream
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValueOnce(streamOf({ text: 'ok' }));

    await expect(runAgent()).resolves.toEqual({ text: 'ok' });
  });

  it('does not retry non-retryable errors and maps them to LLM_UNAVAILABLE', async () => {
    generateContentStream.mockRejectedValueOnce(new ApiError({ message: 'bad request', status: 400 }));

    await expect(runAgent()).rejects.toMatchObject({ statusCode: 503, code: 'LLM_UNAVAILABLE' });
    expect(generateContentStream).toHaveBeenCalledTimes(1);
  });

  it('fails with LLM_UNAVAILABLE when every model is unavailable', async () => {
    generateContentStream.mockRejectedValue(new ApiError({ message: 'quota', status: 429 }));

    await expect(runAgent()).rejects.toMatchObject({
      code: 'LLM_UNAVAILABLE',
      message: expect.stringContaining('Limite de uso'),
    });
    expect(generateContentStream).toHaveBeenCalledTimes(2);
  });

  it('stops the loop after 5 iterations', async () => {
    generateContentStream.mockImplementation(async () =>
      streamOf({ functionCall: { name: 'search_products', args: { query: 'loop' } } }));

    const result = await runAgent();

    expect(generateContentStream).toHaveBeenCalledTimes(5);
    expect(result.text).toContain('Não consegui concluir');
    expect(events.at(-1)).toEqual({ type: 'done' });
  });

  it('switches to the fallback model when the primary does not start responding in time', async () => {
    generateContentStream
      .mockImplementationOnce(async ({ config }) => (async function* () {
        await new Promise((_resolve, reject) => {
          config.abortSignal.addEventListener('abort', () => reject(new Error('aborted')));
        });
        yield { candidates: [] };
      })())
      .mockResolvedValueOnce(streamOf({ text: 'Resposta do fallback.' }));

    const result = await runAgent(makeGateway({ timeoutMs: 20 }));

    expect(result.text).toBe('Resposta do fallback.');
    expect(generateContentStream.mock.calls.map(([params]) => params.model)).toEqual([PRIMARY, FALLBACK]);
  });

  it('does not cut a slow stream after the first chunk arrived', async () => {
    generateContentStream.mockResolvedValueOnce((async function* () {
      yield { candidates: [{ content: { role: 'model', parts: [{ text: 'Começo ' }] } }] };
      await new Promise(resolve => setTimeout(resolve, 60));
      yield { candidates: [{ content: { role: 'model', parts: [{ text: 'e fim.' }] } }] };
    })());

    const result = await runAgent(makeGateway({ timeoutMs: 20 }));

    expect(result.text).toBe('Começo e fim.');
    expect(generateContentStream).toHaveBeenCalledTimes(1);
  });

  it('fails fast when no API key is configured', async () => {
    await expect(runAgent(makeGateway({ apiKey: undefined }))).rejects.toMatchObject({ code: 'LLM_UNAVAILABLE' });
    expect(generateContentStream).not.toHaveBeenCalled();
  });
});
