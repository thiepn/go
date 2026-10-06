export type AccountFailureCategory =
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'rate_limit'
  | 'service'
  | 'request'
  | 'unknown';

export interface ThiepnUser {
  readonly id: string;
  readonly email: string | null;
}

export interface ThiepnSession {
  readonly authenticated: true;
  readonly user: ThiepnUser | null;
  readonly expiresAt: number | null;
}

export interface ThiepnAccount {
  readonly client: any;
  readonly config: {
    readonly sdkVersion: string;
    readonly accountContract: string;
    readonly operationsVersion: string;
    readonly sessionAuthority: 'thiepn-account';
  };
  getSession(): Promise<ThiepnSession | null>;
  getUser(): Promise<ThiepnUser | null>;
  onAuthStateChange(
    callback: (state: {
      readonly event: string;
      readonly session: ThiepnSession | null;
    }) => void,
  ): { unsubscribe?: () => void } | null;
  signInWithPassword(input: {
    readonly email: string;
    readonly password: string;
  }): Promise<ThiepnSession | null>;
  signUpWithPassword(input: {
    readonly email: string;
    readonly password: string;
    readonly redirectTo?: string;
  }): Promise<{
    readonly session: ThiepnSession | null;
    readonly user: ThiepnUser | null;
  }>;
  signInWithGoogle(input?: {
    readonly redirectTo?: string;
  }): Promise<unknown>;
  requestPasswordReset(input: {
    readonly email: string;
    readonly redirectTo?: string;
  }): Promise<true>;
  updatePassword(input: {
    readonly password: string;
    readonly currentPassword?: string;
  }): Promise<ThiepnUser | null>;
  signOut(input?: {
    readonly scope?: 'local' | 'others' | 'global';
  }): Promise<true>;
  classifyError(error: unknown): AccountFailureCategory;
}

interface AccountSdkModule {
  createThiepnAccount(options: {
    readonly createClient: (...args: any[]) => any;
    readonly appSlug: string;
    readonly redirectTo: string;
  }): ThiepnAccount;
}

interface SupabaseModule {
  createClient: (...args: any[]) => any;
}

export const GO_ACCOUNT_SLUG = 'go';
export const GO_ACCOUNT_PATH = '/go/';
export const THIEPN_ACCOUNT_SDK_URL =
  'https://thiepn.dev/account-platform/sdk/v1/index.js';
export const SUPABASE_JS_URL =
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/+esm';

let accountPromise: Promise<ThiepnAccount> | null = null;

function importExternal<T>(url: string): Promise<T> {
  return import(/* @vite-ignore */ url) as Promise<T>;
}

export function supportsThiepnAccountOrigin(
  locationLike: Pick<Location, 'origin' | 'hostname' | 'protocol'>,
): boolean {
  if (locationLike.origin === 'https://thiepn.dev') {
    return true;
  }

  const local =
    locationLike.hostname === 'localhost' ||
    locationLike.hostname === '127.0.0.1';

  return (
    local &&
    (locationLike.protocol === 'http:' ||
      locationLike.protocol === 'https:')
  );
}

export function accountRedirectUrl(): string {
  if (typeof window === 'undefined') {
    return 'https://thiepn.dev/go/';
  }

  if (window.location.origin === 'https://thiepn.dev') {
    return new URL(
      GO_ACCOUNT_PATH,
      window.location.origin,
    ).href;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete('studio');
  url.hash = '';
  return url.href;
}

export async function loadThiepnAccount(): Promise<ThiepnAccount> {
  if (typeof window === 'undefined') {
    throw new Error('THIEPN Account requires a browser.');
  }

  if (!supportsThiepnAccountOrigin(window.location)) {
    throw new Error(
      'THIEPN Account is available on thiepn.dev/go and approved local development origins.',
    );
  }

  accountPromise ??= Promise.all([
    importExternal<AccountSdkModule>(
      THIEPN_ACCOUNT_SDK_URL,
    ),
    importExternal<SupabaseModule>(
      SUPABASE_JS_URL,
    ),
  ]).then(([sdk, supabase]) =>
    sdk.createThiepnAccount({
      createClient: supabase.createClient,
      appSlug: GO_ACCOUNT_SLUG,
      redirectTo: accountRedirectUrl(),
    }),
  );

  return accountPromise;
}
