import { useState } from 'react';

import type { ProblemDefinition } from '../types';
import { PracticeSession } from './PracticeSession';

export interface PracticeHubProps {
  readonly problems: readonly ProblemDefinition[];
  readonly focusedTags?: readonly string[];
  readonly onExit?: () => void;
}

type PracticeMode =
  | 'mixed'
  | 'capture'
  | 'safety'
  | 'connection'
  | 'territory'
  | 'reading';

const MODES: readonly {
  readonly id: PracticeMode;
  readonly title: string;
  readonly description: string;
  readonly tags?: readonly string[];
}[] = [
  {
    id: 'mixed',
    title: 'Mixed review',
    description: 'A short adaptive set across everything you have learned.',
  },
  {
    id: 'capture',
    title: 'Capture',
    description: 'Find last liberties and remove stones or groups.',
    tags: ['capture'],
  },
  {
    id: 'safety',
    title: 'Atari & safety',
    description: 'Notice danger, count liberties, and keep groups alive.',
    tags: ['atari', 'defense'],
  },
  {
    id: 'connection',
    title: 'Connection',
    description: 'Join stones into stronger groups.',
    tags: ['connection'],
  },
  {
    id: 'territory',
    title: 'Territory',
    description: 'Recognize and finish useful boundaries.',
    tags: ['territory'],
  },
  {
    id: 'reading',
    title: 'Reading',
    description: 'Think through more than one move before you play.',
    tags: ['reading'],
  },
];

export function PracticeHub({
  problems,
  focusedTags,
  onExit,
}: PracticeHubProps) {
  const [mode, setMode] = useState<PracticeMode | null>(null);

  if (focusedTags && focusedTags.length > 0) {
    return (
      <PracticeSession
        problems={problems}
        tags={focusedTags}
        sessionSize={5}
        onExit={onExit}
      />
    );
  }

  if (mode) {
    const config = MODES.find((item) => item.id === mode);

    return (
      <PracticeSession
        problems={problems}
        tags={config?.tags}
        sessionSize={mode === 'mixed' ? 6 : 5}
        onExit={() => setMode(null)}
      />
    );
  }

  return (
    <main className="practice-hub-shell">
      <section className="practice-hub" aria-labelledby="practice-hub-title">
        <header className="practice-hub__header">
          <button
            className="lesson-icon-button"
            type="button"
            onClick={onExit}
            aria-label="Leave practice"
            disabled={!onExit}
          >
            ×
          </button>
          <div>
            <p className="eyebrow">Practice</p>
            <h1 id="practice-hub-title">Train one idea at a time.</h1>
            <p>
              Short problems build the reading habits you need before longer games.
            </p>
          </div>
        </header>

        <div className="practice-mode-grid">
          {MODES.map((item) => (
            <button
              key={item.id}
              className="practice-mode-card"
              type="button"
              onClick={() => setMode(item.id)}
            >
              <span className="practice-mode-card__board" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
