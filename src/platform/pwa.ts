export async function registerServiceWorker(): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !import.meta.env.PROD
  ) {
    return false;
  }

  try {
    const appBase = import.meta.env.BASE_URL;

    await navigator.serviceWorker.register(
      `${appBase}sw.js`,
      {
        scope: appBase,
      },
    );
    return true;
  } catch {
    return false;
  }
}
