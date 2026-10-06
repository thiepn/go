import {
  type ChangeEvent,
  type FormEvent,
  useRef,
  useState,
} from 'react';

import {
  downloadGoBackup,
  parseGoBackup,
  restoreGoBackup,
} from './backup';
import { useAccount } from './AccountProvider';
import './account.css';

export interface AccountPanelProps {
  readonly onExit?: () => void;
}

function formatSyncTime(
  value: number | null,
): string {
  if (!value) return 'Not synced yet';

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(value);
}

export function AccountPanel({
  onExit,
}: AccountPanelProps) {
  const account = useAccount();
  const [mode, setMode] = useState<
    'sign-in' | 'sign-up'
  >('sign-in');
  const [email, setEmail] =
    useState('');
  const [password, setPassword] =
    useState('');
  const [busy, setBusy] =
    useState(false);
  const [localMessage, setLocalMessage] =
    useState<string | null>(null);
  const [deleteArmed, setDeleteArmed] =
    useState(false);
  const importRef =
    useRef<HTMLInputElement | null>(null);

  const run = async (
    action: () => Promise<void>,
  ) => {
    setBusy(true);
    setLocalMessage(null);

    try {
      await action();
    } catch {
      // Provider owns safe user-facing account errors.
    } finally {
      setBusy(false);
    }
  };

  const submit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    void run(async () => {
      if (mode === 'sign-in') {
        await account.signIn(
          email.trim(),
          password,
        );
      } else {
        const result =
          await account.signUp(
            email.trim(),
            password,
          );

        if (
          result ===
          'confirmation-required'
        ) {
          setLocalMessage(
            'Confirmation required. Check your email.',
          );
        }
      }
    });
  };

  const importBackup = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setBusy(true);
    setLocalMessage(null);

    try {
      const backup = parseGoBackup(
        await file.text(),
      );
      restoreGoBackup(backup);
      setLocalMessage(
        'Backup merged into this device.',
      );

      if (
        account.status ===
        'signed-in'
      ) {
        await account.syncNow();
      }
    } catch (error) {
      setLocalMessage(
        error instanceof Error
          ? error.message
          : 'Backup could not be imported.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main
      className="account-shell"
      aria-labelledby="account-title"
    >
      <section className="account-panel">
        <header className="account-header">
          <button
            className="lesson-icon-button"
            type="button"
            onClick={onExit}
            aria-label="Leave account"
            disabled={!onExit}
          >
            ×
          </button>

          <div>
            <p className="eyebrow">
              THIEPN Account
            </p>
            <h1 id="account-title">
              Account & sync
            </h1>
            <p>
              Go stays fully usable without an
              account. Sign in only if you want
              shared identity, cross-device
              learning progress, and cloud backup.
            </p>
          </div>
        </header>

        {!account.supportedOrigin && (
          <section className="account-card">
            <h2>Local mode</h2>
            <p>
              This build is outside the approved
              THIEPN Account origin. Local
              learning and JSON backup remain
              available; account sessions are not
              duplicated on another origin.
            </p>
          </section>
        )}

        {account.status === 'checking' && (
          <section
            className="account-card"
            aria-live="polite"
          >
            <h2>Checking account…</h2>
            <p>
              Local learning is available while
              account state resolves.
            </p>
          </section>
        )}

        {account.status === 'signed-out' && (
          <section className="account-card">
            <div className="account-tabs">
              <button
                type="button"
                className={
                  mode === 'sign-in'
                    ? 'is-active'
                    : ''
                }
                onClick={() =>
                  setMode('sign-in')
                }
              >
                Sign in
              </button>
              <button
                type="button"
                className={
                  mode === 'sign-up'
                    ? 'is-active'
                    : ''
                }
                onClick={() =>
                  setMode('sign-up')
                }
              >
                Create account
              </button>
            </div>

            <form
              className="account-form"
              onSubmit={submit}
            >
              <label>
                Email
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  autoComplete={
                    mode === 'sign-in'
                      ? 'current-password'
                      : 'new-password'
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  minLength={8}
                  required
                />
              </label>

              <button
                className="primary-action account-primary"
                type="submit"
                disabled={busy}
              >
                {mode === 'sign-in'
                  ? 'Sign in'
                  : 'Create account'}
              </button>
            </form>

            <div className="account-alt-actions">
              <button
                className="secondary-action"
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(
                    account.signInWithGoogle,
                  )
                }
              >
                Continue with Google
              </button>

              {mode === 'sign-in' && (
                <button
                  className="account-link-action"
                  type="button"
                  disabled={
                    busy ||
                    email.trim().length === 0
                  }
                  onClick={() =>
                    void run(() =>
                      account.requestPasswordReset(
                        email.trim(),
                      ),
                    )
                  }
                >
                  Send password reset
                </button>
              )}
            </div>
          </section>
        )}

        {account.status === 'signed-in' && (
          <section className="account-card">
            <div className="account-identity">
              <div>
                <span>Signed in</span>
                <strong>
                  {account.user?.email ??
                    'THIEPN Account'}
                </strong>
              </div>
              <button
                className="secondary-action"
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(account.signOut)
                }
              >
                Sign out on this device
              </button>
            </div>

            <div className="account-sync-status">
              <span>Cross-device sync</span>
              <strong>
                {account.syncStatus ===
                'syncing'
                  ? 'Syncing…'
                  : account.syncStatus ===
                      'error'
                    ? 'Needs retry'
                    : formatSyncTime(
                        account.lastSyncedAt,
                      )}
              </strong>
              <button
                type="button"
                className="account-link-action"
                disabled={
                  busy ||
                  account.syncStatus ===
                    'syncing'
                }
                onClick={() =>
                  void run(account.syncNow)
                }
              >
                Sync now
              </button>
            </div>
          </section>
        )}

        <section className="account-card">
          <h2>Backup & restore</h2>
          <p>
            Export a portable JSON backup of
            durable Go learning data. Import
            merges progress instead of replacing
            newer local work.
          </p>

          <div className="account-data-actions">
            <button
              className="secondary-action"
              type="button"
              onClick={downloadGoBackup}
            >
              Export backup
            </button>
            <button
              className="secondary-action"
              type="button"
              disabled={busy}
              onClick={() =>
                importRef.current?.click()
              }
            >
              Import backup
            </button>
            <input
              ref={importRef}
              className="sr-only"
              type="file"
              accept="application/json,.json"
              onChange={(event) =>
                void importBackup(event)
              }
            />
          </div>
        </section>

        {account.status === 'signed-in' && (
          <section className="account-card account-card--danger">
            <h2>Go cloud data</h2>
            <p>
              Delete only Go's cloud learning
              data. Your THIEPN Account and local
              Go data stay intact.
            </p>

            <button
              className={
                deleteArmed
                  ? 'account-danger-action is-armed'
                  : 'account-danger-action'
              }
              type="button"
              disabled={busy}
              onClick={() => {
                if (!deleteArmed) {
                  setDeleteArmed(true);
                  return;
                }

                setDeleteArmed(false);
                void run(
                  account.deleteCloudData,
                );
              }}
            >
              {deleteArmed
                ? 'Confirm delete cloud Go data'
                : 'Delete cloud Go data'}
            </button>
          </section>
        )}

        {(account.message ||
          localMessage) && (
          <p
            className="account-message"
            role="status"
            aria-live="polite"
          >
            {localMessage ??
              account.message}
          </p>
        )}

        <p className="account-boundary">
          THIEPN Account owns identity,
          sessions, credentials, recovery, and
          account deletion. Go owns only Go
          learning data.
        </p>
      </section>
    </main>
  );
}
