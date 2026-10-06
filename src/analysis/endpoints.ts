function normalizedBase(): string {
  const configured =
    import.meta.env.VITE_KATAGO_API_BASE?.trim();

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  return `${import.meta.env.BASE_URL}api/katago`.replace(
    /\/$/,
    '',
  );
}

export function kataGoEndpoint(
  path: 'analyze' | 'health',
): string {
  return `${normalizedBase()}/${path}`;
}
