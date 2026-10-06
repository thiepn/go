export async function registerServiceWorker(): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !import.meta.env.PROD
  ) {
    return false;
  }

  try {
    await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return true;
  } catch {
    return false;
  }
}
