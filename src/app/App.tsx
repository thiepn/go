import { useState } from 'react';

import {
  beginnerCourse,
  firstGuidedGame,
} from '../content';
import { GuidedGamePlayer } from '../guided';
import { CoursePlayer } from '../learning';

type AppMode = 'home' | 'course' | 'guided-game';

function markFirstGameComplete(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      'thiepn-go:guided:first-9x9:complete',
      'true',
    );
  } catch {
    // Completion feedback must not depend on storage availability.
  }
}

export function App() {
  const [mode, setMode] = useState<AppMode>('home');

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
          setMode('home');
        }}
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
          each rule through interaction, then play your first complete guided
          9×9 game.
        </p>

        <button
          className="primary-action"
          type="button"
          onClick={() => setMode('course')}
        >
          Start learning
        </button>

        <p className="secondary-copy">
          12 interactive lessons · guided first game · no account required
        </p>
      </section>
    </main>
  );
}
