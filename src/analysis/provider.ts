import {
  kataGoEndpoint,
} from './endpoints';
import type {
  KataGoProvider,
  KataGoQuery,
  KataGoResponseRaw,
} from './types';

export class KataGoUnavailableError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'KataGoUnavailableError';
  }
}

export interface HttpKataGoProviderOptions {
  readonly endpoint?: string;
  readonly fetchImpl?: typeof fetch;
}

export class HttpKataGoProvider
  implements KataGoProvider {
  private readonly endpoint: string;
  private readonly fetchImpl: typeof fetch;

  public constructor(
    options: HttpKataGoProviderOptions = {},
  ) {
    this.endpoint =
      options.endpoint ??
      kataGoEndpoint('analyze');
    this.fetchImpl =
      options.fetchImpl ?? fetch;
  }

  public async analyze(
    query: KataGoQuery,
  ): Promise<readonly KataGoResponseRaw[]> {
    let response: Response;

    try {
      response = await this.fetchImpl(
        this.endpoint,
        {
          method: 'POST',
          headers: {
            'content-type':
              'application/json',
          },
          body: JSON.stringify(query),
        },
      );
    } catch {
      throw new KataGoUnavailableError(
        'KataGo analysis service is unreachable.',
      );
    }

    const body: unknown = await response
      .json()
      .catch(() => null);

    const envelope =
      body !== null &&
      typeof body === 'object' &&
      !Array.isArray(body)
        ? body as {
            responses?: readonly KataGoResponseRaw[];
            error?: string;
          }
        : null;

    if (!response.ok) {
      const message =
        typeof envelope?.error === 'string'
          ? envelope.error
          : `KataGo analysis failed with HTTP ${response.status}.`;

      throw new KataGoUnavailableError(
        message,
      );
    }

    const responses =
      Array.isArray(body)
        ? body as readonly KataGoResponseRaw[]
        : envelope?.responses;

    if (!responses) {
      throw new Error(
        'KataGo analysis returned an invalid response envelope.',
      );
    }

    const error = responses.find(
      (item) =>
        typeof item.error === 'string',
    );

    if (error?.error) {
      throw new Error(
        error.field
          ? `${error.error} (${error.field})`
          : error.error,
      );
    }

    return responses.filter(
      (item) =>
        item.isDuringSearch !== true &&
        typeof item.turnNumber === 'number',
    );
  }
}

export const defaultKataGoProvider =
  new HttpKataGoProvider();
