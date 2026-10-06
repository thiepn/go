import {
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  detectDisplayMode,
  displayModeLabel,
} from './display-mode';
import {
  getPreferences,
  setPreferences,
  subscribePreferences,
} from './preferences';
import { listRecoveryEntries } from './storage';
import './platform.css';

export interface PlatformSettingsProps {
  readonly onExit?: () => void;
}

type OfflineState =
  | 'unsupported'
  | 'checking'
  | 'ready'
  | 'available-after-reload';

export function PlatformSettings({
  onExit,
}: PlatformSettingsProps) {
  const preferences = useSyncExternalStore(
    subscribePreferences,
    getPreferences,
    getPreferences,
  );
  const [online, setOnline] = useState(
    () =>
      typeof navigator === 'undefined'
        ? true
        : navigator.onLine,
  );
  const [displayMode] = useState(
    () => detectDisplayMode(),
  );
  const [offlineState, setOfflineState] =
    useState<OfflineState>('checking');

  const recoveries = listRecoveryEntries();

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    if (
      typeof navigator === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      setOfflineState('unsupported');
      return;
    }

    let active = true;

    void navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (!active) return;

        setOfflineState(
          navigator.serviceWorker.controller
            ? 'ready'
            : registration
              ? 'available-after-reload'
              : 'checking',
        );
      })
      .catch(() => {
        if (active) setOfflineState('unsupported');
      });

    return () => {
      active = false;
    };
  }, []);

  const offlineCopy =
    offlineState === 'ready'
      ? 'Offline cache is active.'
      : offlineState === 'available-after-reload'
        ? 'Offline cache is installed and will control the next visit.'
        : offlineState === 'unsupported'
          ? 'This browser does not expose service-worker offline support.'
          : 'Offline support is being prepared.';

  return (
    <main
      className="platform-settings-shell"
      aria-labelledby="platform-settings-title"
    >
      <section className="platform-settings">
        <header className="platform-settings__header">
          <button
            className="lesson-icon-button"
            type="button"
            onClick={onExit}
            aria-label="Leave settings"
            disabled={!onExit}
          >
            ×
          </button>
          <div>
            <p className="eyebrow">Settings</p>
            <h1 id="platform-settings-title">
              Device & accessibility
            </h1>
            <p>
              Keep board feedback useful without making the learning
              experience noisy or physically uncomfortable.
            </p>
          </div>
        </header>

        <div className="platform-settings__grid">
          <section className="platform-settings-card">
            <div>
              <h2>Board feedback</h2>
              <p>
                Feedback never changes whether a move is legal or correct.
              </p>
            </div>

            <label className="platform-toggle">
              <span>
                <strong>Haptics</strong>
                <small>
                  Vibrate briefly for moves, captures, and important feedback
                  when supported by the device.
                </small>
              </span>
              <input
                type="checkbox"
                checked={preferences.haptics}
                onChange={(event) =>
                  setPreferences({
                    haptics: event.target.checked,
                  })
                }
              />
            </label>

            <label className="platform-toggle">
              <span>
                <strong>Sound</strong>
                <small>
                  Use short generated tones. Sound is off by default.
                </small>
              </span>
              <input
                type="checkbox"
                checked={preferences.sound}
                onChange={(event) =>
                  setPreferences({
                    sound: event.target.checked,
                  })
                }
              />
            </label>
          </section>

          <section className="platform-settings-card">
            <div>
              <h2>Motion</h2>
              <p>
                The operating-system reduced-motion preference is always
                respected.
              </p>
            </div>

            <label className="platform-toggle">
              <span>
                <strong>Reduce motion further</strong>
                <small>
                  Disable decorative transitions and board animations even
                  when the system does not request reduced motion.
                </small>
              </span>
              <input
                type="checkbox"
                checked={preferences.reduceMotion}
                onChange={(event) =>
                  setPreferences({
                    reduceMotion: event.target.checked,
                  })
                }
              />
            </label>
          </section>

          <section className="platform-settings-card">
            <div>
              <h2>Reading & contrast</h2>
              <p>
                Browser zoom still works normally. These options add a stable
                in-app variant for longer study sessions.
              </p>
            </div>

            <label className="platform-toggle">
              <span>
                <strong>Larger interface text</strong>
                <small>
                  Increase the app's base text size while preserving responsive
                  reflow.
                </small>
              </span>
              <input
                type="checkbox"
                checked={preferences.largeText}
                onChange={(event) =>
                  setPreferences({
                    largeText: event.target.checked,
                  })
                }
              />
            </label>

            <label className="platform-toggle">
              <span>
                <strong>Higher contrast</strong>
                <small>
                  Strengthen secondary text, borders, and focus treatment in
                  addition to any operating-system contrast preference.
                </small>
              </span>
              <input
                type="checkbox"
                checked={preferences.highContrast}
                onChange={(event) =>
                  setPreferences({
                    highContrast: event.target.checked,
                  })
                }
              />
            </label>
          </section>

          <section className="platform-settings-card">
            <div>
              <h2>Board orientation</h2>
              <p>
                Coordinates provide a persistent spatial reference without
                changing the rules or lesson content.
              </p>
            </div>

            <label className="platform-toggle">
              <span>
                <strong>Show board coordinates</strong>
                <small>
                  Display standard Go coordinates on every board. The letter I
                  is skipped, following Go convention.
                </small>
              </span>
              <input
                type="checkbox"
                checked={preferences.showCoordinates}
                onChange={(event) =>
                  setPreferences({
                    showCoordinates: event.target.checked,
                  })
                }
              />
            </label>
          </section>

          <section className="platform-settings-card">
            <div>
              <h2>Offline & storage</h2>
              <p>
                Core learning remains local-first. Engine analysis may still
                require a network connection.
              </p>
            </div>

            <dl className="platform-status-list">
              <div>
                <dt>Network</dt>
                <dd>{online ? 'Online' : 'Offline'}</dd>
              </div>
              <div>
                <dt>Launch mode</dt>
                <dd>{displayModeLabel(displayMode)}</dd>
              </div>
              <div>
                <dt>Offline app</dt>
                <dd>{offlineCopy}</dd>
              </div>
              <div>
                <dt>Recovered data</dt>
                <dd>
                  {recoveries.length === 0
                    ? 'No corrupted local records detected.'
                    : `${recoveries.length} damaged record${recoveries.length === 1 ? '' : 's'} quarantined safely.`}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </section>
    </main>
  );
}
