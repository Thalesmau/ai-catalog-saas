import { API_URL, authHeaders, networkError, notifyUnauthorized, toApiError } from './http';

export type SseMessage = {
  event: string;
  data: unknown;
};

type StreamOptions = {
  body: unknown;
  signal: AbortSignal;
  onMessage: (message: SseMessage) => void;
};

function parseBlock(block: string): SseMessage | null {
  let event = 'message';
  const dataLines: string[] = [];

  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  try {
    return { event, data: JSON.parse(dataLines.join('\n')) };
  } catch {
    return null;
  }
}

export async function postSse(path: string, { body, signal, onMessage }: StreamOptions): Promise<void> {
  const headers = authHeaders();
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      signal,
      headers: { ...headers, 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw error;
    }

    throw networkError();
  }

  if (!response.ok || !response.body) {
    if (response.status === 401 && headers.Authorization) {
      notifyUnauthorized();
    }

    throw await toApiError(response);
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += value.replace(/\r\n/g, '\n');
    let separator = buffer.indexOf('\n\n');

    while (separator !== -1) {
      const message = parseBlock(buffer.slice(0, separator));
      buffer = buffer.slice(separator + 2);

      if (message) {
        onMessage(message);
      }

      separator = buffer.indexOf('\n\n');
    }
  }
}
