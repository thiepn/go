export interface KataGoHealth {
  readonly configured: boolean;
  readonly ready: boolean;
  readonly humanModel: boolean;
}

export async function fetchKataGoHealth(
  fetchImpl: typeof fetch = fetch,
): Promise<KataGoHealth> {
  try {
    const response = await fetchImpl(
      '/api/katago/health',
      {
        headers: {
          accept: 'application/json',
        },
      },
    );

    const body = await response.json();

    return {
      configured:
        body?.configured === true,
      ready:
        body?.ready === true,
      humanModel:
        body?.humanModel === true,
    };
  } catch {
    return {
      configured: false,
      ready: false,
      humanModel: false,
    };
  }
}
