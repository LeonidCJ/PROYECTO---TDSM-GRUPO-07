import { env } from '@/src/core/config/env';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function httpRequest<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const { method = 'GET', body, headers, signal } = options;
  const response = await fetch(`${env.apiBaseUrl}${path}`,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    }
  );

  if (!response.ok) {
    const errorBody = await safeJson(response);
    const message = errorBody?.detail ?? errorBody?.message ?? 'Request failed';
    throw new Error(message);
  }

  return (await safeJson(response)) as T;
}

async function safeJson(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
