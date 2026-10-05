import { useState } from 'react';

import { firstStoneLesson } from '../content/lessons';
import { LessonPlayer } from '../learning';

export function App() {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <LessonPlayer
        lesson={firstStoneLesson}
        onExit={() => setStarted(false)}
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
          No rulebook first. Learn directly on the board, see what every move
          changes, and grow into real games as each idea becomes clear.
        </p>

        <button
          className="primary-action"
          type="button"
          onClick={() => setStarted(true)}
        >
          Start learning
        </button>

        <p className="secondary-copy">No account required.</p>
      </section>
    </main>
  );
}
