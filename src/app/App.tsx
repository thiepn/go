import { useState } from 'react';

import { beginnerCourse } from '../content';
import { CoursePlayer } from '../learning';

export function App() {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <CoursePlayer
        course={beginnerCourse}
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
          Start with no Go knowledge. Learn directly on the board, understand
          each rule through interaction, and finish ready for your first guided
          9×9 game.
        </p>

        <button
          className="primary-action"
          type="button"
          onClick={() => setStarted(true)}
        >
          Start learning
        </button>

        <p className="secondary-copy">
          12 interactive lessons · progress saved on this device · no account required
        </p>
      </section>
    </main>
  );
}
