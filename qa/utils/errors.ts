export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly method: string;
  readonly url: string;
  readonly responseBody: string;

  constructor(params: {
    message: string;
    status: number;
    statusText: string;
    method: string;
    url: string;
    responseBody: string;
  }) {
    super(params.message);
    this.name = 'HttpError';
    this.status = params.status;
    this.statusText = params.statusText;
    this.method = params.method;
    this.url = params.url;
    this.responseBody = params.responseBody;
  }
}
