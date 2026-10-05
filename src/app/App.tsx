import { useState } from 'react';

import {
  beginnerCourse,
  beginnerProblems,
  firstGuidedGame,
} from '../content';
import { GuidedGamePlayer } from '../guided';
import { CoursePlayer } from '../learning';
import { PracticeHub } from '../practice';

type AppMode = 'home' | 'course' | 'guided-game' | 'practice';

const FIRST_GAME_COMPLETE_KEY =
  'thiepn-go:guided:first-9x9:complete';

function hasFirstGameComplete(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(FIRST_GAME_COMPLETE_KEY) === 'true';
  } catch {
    return false;
  }
}

function markFirstGameComplete(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      FIRST_GAME_COMPLETE_KEY,
      'true',
    );
  } catch {
    // Completion feedback must not depend on storage availability.
  }
}

export function App() {
  const [mode, setMode] = useState<AppMode>('home');
  const [practiceUnlocked, setPracticeUnlocked] = useState(
    () => hasFirstGameComplete(),
  );

  if (mode === 'course') {
    return (
      <CoursePlayer
        course={beginnerCourse}
        onExit={() => setMode('home')}
        onReadyForGame={() => setMode('guided-game')}
      />
    );
  }

  if (mode === 'guided-game') {
    return (
      <GuidedGamePlayer
        scenario={firstGuidedGame}
        onExit={() => setMode('home')}
        onComplete={() => {
          markFirstGameComplete();
          setPracticeUnlocked(true);
          setMode('home');
        }}
      />
    );
  }

  if (mode === 'practice') {
    return (
      <PracticeHub
        problems={beginnerProblems}
        onExit={() => setMode('home')}
      />
    );
  }

  return (
    <main className="app-shell">
      <section className="welcome" aria-labelledby="welcome-title">
        <div className="brand-mark" aria-hidden="true">
          <span className="brand-stone brand-stone--black" />
          <span className="brand-stone brand-stone--white" />
        </div>

        <p className="eyebrow">Learn Go from zero</p>
        <h1 id="welcome-title">One stone at a time.</h1>
        <p className="welcome-copy">
          Start with no Go knowledge. Learn directly on the board, understand
          each rule through interaction, then build skill through real games
          and short practice problems.
        </p>

        <div className="home-actions">
          <button
            className="primary-action"
            type="button"
            onClick={() => setMode('course')}
          >
            {practiceUnlocked ? 'Continue learning' : 'Start learning'}
          </button>

          {practiceUnlocked && (
            <button
              className="home-secondary-action"
              type="button"
              onClick={() => setMode('practice')}
            >
              Practice
            </button>
          )}
        </div>

        <p className="secondary-copy">
          {practiceUnlocked
            ? 'Lessons · guided game · adaptive practice · no account required'
            : '12 interactive lessons · guided first game · no account required'}
        </p>
      </section>
    </main>
  );
}
