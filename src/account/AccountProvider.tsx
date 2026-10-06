import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  loadThiepnAccount,
  supportsThiepnAccountOrigin,
  type AccountFailureCategory,
  type ThiepnAccount,
  type ThiepnUser,
} from './runtime';
import {
  deleteGoCloudState,
  syncGoState,
} from './sync';

export type AccountStatus =
  | 'checking'
  | 'signed-out'
  | 'signed-in'
  | 'unavailable';

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'error';

interface AccountContextValue {
  readonly status: AccountStatus;
  readonly user: ThiepnUser | null;
  readonly syncStatus: SyncStatus;
  readonly lastSyncedAt: number | null;
  readonly message: string | null;
  readonly supportedOrigin: boolean;
  signIn(
    email: string,
    password: string,
  ): Promise<void>;
  signUp(
    email: string,
    password: string,
  ): Promise<'signed-in' | 'confirmation-required'>;
  signInWithGoogle(): Promise<void>;
  requestPasswordReset(
    email: string,
  ): Promise<void>;
  signOut(): Promise<void>;
  syncNow(): Promise<void>;
  deleteCloudData(): Promise<void>;
  classifyError(
    error: unknown,
  ): AccountFailureCategory;
}

const AccountContext =
  createContext<AccountContextValue | null>(
    null,
  );

function userMessage(
  category: AccountFailureCategory,
): string {
  switch (category) {
    case 'network':
      return 'Account temporarily unavailable. Local learning still works.';
    case 'authentication':
      return 'The session is no longer valid. Sign in again.';
    case 'authorization':
      return 'This account is not allowed to access that Go data.';
    case 'rate_limit':
      return 'Too many account requests. Try again later.';
    case 'service':
      return 'The account service is temporarily unavailable.';
    case 'request':
      return 'The account request could not be completed.';
    default:
      return 'Account state could not be updated.';
  }
}

export function AccountProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const supportedOrigin =
    typeof window !== 'undefined' &&
    supportsThiepnAccountOrigin(
      window.location,
    );

  const [status, setStatus] =
    useState<AccountStatus>(
      supportedOrigin
        ? 'checking'
        : 'unavailable',
    );
  const [user, setUser] =
    useState<ThiepnUser | null>(null);
  const [syncStatus, setSyncStatus] =
    useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] =
    useState<number | null>(null);
  const [message, setMessage] =
    useState<string | null>(
      supportedOrigin
        ? null
        : 'Account sync is available on thiepn.dev/go. This build remains fully usable locally.',
    );

  const accountRef =
    useRef<ThiepnAccount | null>(null);
  const userRef =
    useRef<ThiepnUser | null>(null);
  const syncPromiseRef =
    useRef<Promise<void> | null>(null);
  const debounceRef =
    useRef<number | null>(null);

  const classifyError = useCallback(
    (error: unknown): AccountFailureCategory =>
      accountRef.current?.classifyError(
        error,
      ) ?? 'unknown',
    [],
  );

  const runSync = useCallback(async () => {
    const account = accountRef.current;
    const currentUser = userRef.current;

    if (!account || !currentUser) return;

    if (syncPromiseRef.current) {
      return syncPromiseRef.current;
    }

    setSyncStatus('syncing');

    const promise = syncGoState(
      account,
      currentUser,
    )
      .then((result) => {
        setLastSyncedAt(result.syncedAt);
        setSyncStatus('synced');
        setMessage(null);
      })
      .catch((error: unknown) => {
        setSyncStatus('error');
        setMessage(
          userMessage(
            account.classifyError(error),
          ),
        );
        throw error;
      })
      .finally(() => {
        syncPromiseRef.current = null;
      });

    syncPromiseRef.current = promise;
    return promise;
  }, []);

  const setSignedInUser = useCallback(
    (
      nextUser: ThiepnUser,
      shouldSync = true,
    ) => {
      userRef.current = nextUser;
      setUser(nextUser);
      setStatus('signed-in');
      setMessage(null);

      if (shouldSync) {
        void runSync().catch(() => {
          // Local learning remains available.
        });
      }
    },
    [runSync],
  );

  const resolveSession = useCallback(
    async (account: ThiepnAccount) => {
      try {
        const session =
          await account.getSession();
        const nextUser = session?.user ?? null;

        if (nextUser) {
          setSignedInUser(nextUser);
        } else {
          userRef.current = null;
          setUser(null);
          setStatus('signed-out');
          setSyncStatus('idle');
          setMessage(null);
        }
      } catch (error) {
        setStatus('unavailable');
        setMessage(
          userMessage(
            account.classifyError(error),
          ),
        );
      }
    },
    [setSignedInUser],
  );

  useEffect(() => {
    if (!supportedOrigin) return undefined;

    let active = true;
    let subscription:
      | { unsubscribe?: () => void }
      | null = null;

    void loadThiepnAccount()
      .then(async (account) => {
        if (!active) return;
        accountRef.current = account;
        await resolveSession(account);

        subscription =
          account.onAuthStateChange(
            ({ event, session }) => {
              if (!active) return;

              const nextUser =
                session?.user ?? null;

              if (nextUser) {
                setSignedInUser(
                  nextUser,
                  event !== 'INITIAL_SESSION',
                );
                return;
              }

              if (
                event === 'SIGNED_OUT' ||
                event === 'USER_DELETED'
              ) {
                userRef.current = null;
                setUser(null);
                setStatus('signed-out');
                setSyncStatus('idle');
                setMessage(null);
              }
            },
          );
      })
      .catch((error: unknown) => {
        if (!active) return;

        setStatus('unavailable');
        setMessage(
          userMessage(
            classifyError(error),
          ),
        );
      });

    return () => {
      active = false;
      subscription?.unsubscribe?.();
    };
  }, [
    classifyError,
    resolveSession,
    setSignedInUser,
    supportedOrigin,
  ]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      status !== 'signed-in'
    ) {
      return undefined;
    }

    const schedule = () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(
          debounceRef.current,
        );
      }

      debounceRef.current =
        window.setTimeout(() => {
          void runSync().catch(() => {
            // Failure state is exposed in account UI.
          });
        }, 1400);
    };

    const handleOnline = () => schedule();
    window.addEventListener(
      'thiepn-go:storage-write',
      schedule,
    );
    window.addEventListener(
      'online',
      handleOnline,
    );

    return () => {
      window.removeEventListener(
        'thiepn-go:storage-write',
        schedule,
      );
      window.removeEventListener(
        'online',
        handleOnline,
      );
      if (debounceRef.current !== null) {
        window.clearTimeout(
          debounceRef.current,
        );
      }
    };
  }, [runSync, status]);

  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ) => {
      const account =
        accountRef.current ??
        (await loadThiepnAccount());
      accountRef.current = account;

      try {
        const session =
          await account.signInWithPassword({
            email,
            password,
          });
        const nextUser =
          session?.user ??
          (await account.getUser());

        if (!nextUser) {
          throw new Error(
            'Sign-in completed without an account user.',
          );
        }

        setSignedInUser(nextUser);
      } catch (error) {
        setMessage(
          userMessage(
            account.classifyError(error),
          ),
        );
        throw error;
      }
    },
    [setSignedInUser],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
    ) => {
      const account =
        accountRef.current ??
        (await loadThiepnAccount());
      accountRef.current = account;

      try {
        const result =
          await account.signUpWithPassword({
            email,
            password,
          });

        if (result.session?.user) {
          setSignedInUser(
            result.session.user,
          );
          return 'signed-in' as const;
        }

        setMessage(
          'Check your email to confirm the account, then return here to sign in.',
        );
        return 'confirmation-required' as const;
      } catch (error) {
        setMessage(
          userMessage(
            account.classifyError(error),
          ),
        );
        throw error;
      }
    },
    [setSignedInUser],
  );

  const signInWithGoogle =
    useCallback(async () => {
      const account =
        accountRef.current ??
        (await loadThiepnAccount());
      accountRef.current = account;

      try {
        await account.signInWithGoogle();
      } catch (error) {
        setMessage(
          userMessage(
            account.classifyError(error),
          ),
        );
        throw error;
      }
    }, []);

  const requestPasswordReset =
    useCallback(async (email: string) => {
      const account =
        accountRef.current ??
        (await loadThiepnAccount());
      accountRef.current = account;

      try {
        await account.requestPasswordReset({
          email,
        });
        setMessage(
          'Password-reset email sent.',
        );
      } catch (error) {
        setMessage(
          userMessage(
            account.classifyError(error),
          ),
        );
        throw error;
      }
    }, []);

  const signOut = useCallback(async () => {
    const account = accountRef.current;
    if (!account) return;

    await account.signOut({
      scope: 'local',
    });
    userRef.current = null;
    setUser(null);
    setStatus('signed-out');
    setSyncStatus('idle');
    setMessage(null);
  }, []);

  const deleteCloudData =
    useCallback(async () => {
      const account = accountRef.current;
      const currentUser = userRef.current;

      if (!account || !currentUser) {
        return;
      }

      await deleteGoCloudState(
        account,
        currentUser,
      );
      setLastSyncedAt(null);
      setSyncStatus('idle');
      setMessage(
        'Cloud Go data deleted. Local Go data remains on this device.',
      );
    }, []);

  const value = useMemo<AccountContextValue>(
    () => ({
      status,
      user,
      syncStatus,
      lastSyncedAt,
      message,
      supportedOrigin,
      signIn,
      signUp,
      signInWithGoogle,
      requestPasswordReset,
      signOut,
      syncNow: runSync,
      deleteCloudData,
      classifyError,
    }),
    [
      status,
      user,
      syncStatus,
      lastSyncedAt,
      message,
      supportedOrigin,
      signIn,
      signUp,
      signInWithGoogle,
      requestPasswordReset,
      signOut,
      runSync,
      deleteCloudData,
      classifyError,
    ],
  );

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount(): AccountContextValue {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error(
      'useAccount must be used inside AccountProvider.',
    );
  }

  return context;
}
