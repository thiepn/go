export default async function handler(
  request,
  response,
) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({
      error: 'Method not allowed.',
    });
    return;
  }

  const bridgeUrl =
    process.env.KATAGO_BRIDGE_URL;

  if (!bridgeUrl) {
    response.status(200).json({
      configured: false,
      ready: false,
    });
    return;
  }

  try {
    const upstream = await fetch(
      `${bridgeUrl.replace(/\/$/, '')}/health`,
      {
        headers: process.env
          .KATAGO_BRIDGE_TOKEN
          ? {
              authorization:
                `Bearer ${process.env.KATAGO_BRIDGE_TOKEN}`,
            }
          : {},
      },
    );

    const body = await upstream
      .json()
      .catch(() => ({}));

    response.status(
      upstream.ok ? 200 : 503,
    ).json({
      configured: true,
      ready:
        upstream.ok &&
        body?.ready === true,
      humanModel:
        body?.humanModel === true,
    });
  } catch {
    response.status(503).json({
      configured: true,
      ready: false,
    });
  }
}
