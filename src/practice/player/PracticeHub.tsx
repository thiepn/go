import { useState } from 'react';

import type { ProblemDefinition } from '../types';
import {
  PracticeSession,
  type PracticeSessionSummary,
} from './PracticeSession';

export interface PracticeHubProps {
  readonly problems: readonly ProblemDefinition[];
  readonly focusedTags?: readonly string[];
  readonly onExit?: () => void;
  readonly onComplete?: (
    summary: PracticeSessionSummary,
  ) => void;
}

type PracticeMode =
  | 'mixed'
  | 'capture'
  | 'safety'
  | 'connection'
  | 'territory'
  | 'reading'
  | 'tactics'
  | 'life-death'
  | 'shape'
  | 'fighting'
  | 'strategy'
  | 'endgame'
  | 'joseki';

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
  {
    id: 'tactics',
    title: 'Tactical patterns',
    description: 'Ladders, nets, snapback, and capturing races.',
    tags: ['ladder', 'net', 'snapback', 'capturing-race'],
  },
  {
    id: 'life-death',
    title: 'Life & death',
    description: 'False eyes, vital points, seki, and survival reading.',
    tags: ['life-death', 'false-eye', 'vital-point', 'seki'],
  },
  {
    id: 'shape',
    title: 'Shape & cuts',
    description: 'Connection, cuts, efficient shape, and weak groups.',
    tags: ['shape', 'cut', 'weak-groups', 'connection'],
  },
  {
    id: 'fighting',
    title: 'Attack & defense',
    description: 'Pressure weak groups while keeping your own stones safe.',
    tags: ['attack', 'defense', 'reading'],
  },
  {
    id: 'strategy',
    title: 'Whole-board strategy',
    description: 'Influence, invasions, reductions, and opening direction.',
    tags: ['influence', 'invasion', 'reduction', 'opening', 'strategy'],
  },
  {
    id: 'endgame',
    title: 'Sente & endgame',
    description: 'Keep initiative and compare the last valuable boundaries.',
    tags: ['sente', 'endgame'],
  },
  {
    id: 'joseki',
    title: 'Intro joseki',
    description: 'Practice local corner shape without memorizing blindly.',
    tags: ['joseki', 'opening', 'shape'],
  },
];

export function PracticeHub({
  problems,
  focusedTags,
  onExit,
  onComplete,
}: PracticeHubProps) {
  const [mode, setMode] = useState<PracticeMode | null>(null);

  if (focusedTags && focusedTags.length > 0) {
    return (
      <PracticeSession
        problems={problems}
        tags={focusedTags}
        sessionSize={5}
        onExit={onExit}
        onComplete={onComplete}
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
        onComplete={onComplete}
      />
    );
  }

  const visibleModes = MODES.filter(
    (item) =>
      !item.tags ||
      item.tags.length === 0 ||
      problems.some(
        (problem) =>
          problem.tags.some(
            (tag) =>
              item.tags?.includes(tag),
          ),
      ),
  );

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
          {visibleModes.map((item) => (
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
