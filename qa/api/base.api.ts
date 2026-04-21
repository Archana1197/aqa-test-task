import { APIRequestContext, APIResponse } from '@playwright/test';
import { RuntimeConfig } from '../config/runtime';
import { retryWithBackoff } from '../utils/retry';
import { HttpError } from '../utils/errors';

interface RequestOptions {
  token?: string;
  data?: unknown;
  headers?: Record<string, string>;
}

export abstract class BaseAPI {
  protected readonly context: APIRequestContext;
  protected readonly baseURL: string;

  constructor(context: APIRequestContext, baseURL: string = RuntimeConfig.environment.baseUrl) {
    this.context = context;
    this.baseURL = baseURL;
  }

  protected async getJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.requestJson<T>('GET', path, options);
  }

  protected async postJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.requestJson<T>('POST', path, options);
  }

  protected async putJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.requestJson<T>('PUT', path, options);
  }

  protected async deleteStatus(path: string, options: RequestOptions = {}): Promise<number> {
    const response = await retryWithBackoff(() => this.send('DELETE', path, options));
    return response.status();
  }

  protected async requestJson<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const response = await retryWithBackoff(async () => {
      const res = await this.send(method, path, options);
      if (!res.ok()) {
        await this.throwHttpError(method, path, res);
      }
      return res;
    });

    return await response.json() as T;
  }

  protected async send(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options: RequestOptions = {}
  ): Promise<APIResponse> {
    const url = this.getUrl(path);
    const headers: Record<string, string> = {
      ...(options.headers ?? {}),
    };

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const payload = {
      headers,
      data: options.data,
    };

    if (method === 'GET') {
      return this.context.get(url, payload);
    }
    if (method === 'POST') {
      return this.context.post(url, payload);
    }
    if (method === 'PUT') {
      return this.context.put(url, payload);
    }
    return this.context.delete(url, payload);
  }

  protected getUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${this.baseURL}${path}`;
  }

  protected async throwHttpError(
    method: string,
    path: string,
    response: APIResponse,
    actionLabel?: string
  ): Promise<never> {
    const url = this.getUrl(path);
    const body = await response.text();
    const bodySummary = body.trim().length > 0 ? body : '<empty response body>';
    const label = actionLabel ?? `${method} ${path}`;

    throw new HttpError({
      message: `${label} failed: ${response.status()} ${response.statusText()} | body: ${bodySummary}`,
      status: response.status(),
      statusText: response.statusText(),
      method,
      url,
      responseBody: bodySummary,
    });
  }
}
