import { useState } from 'react';

import {
  beginnerCourse,
  beginnerProblems,
  firstGuidedGame,
} from '../content';
import { GuidedGamePlayer } from '../guided';
import { CoursePlayer } from '../learning';
import { MasteryDashboard } from '../mastery/player';
import { recordMasteryEvidence } from '../mastery/store';
import { PracticeHub } from '../practice';

type AppMode =
  | 'home'
  | 'course'
  | 'guided-game'
  | 'practice'
  | 'progress';

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
  const [practiceFocus, setPracticeFocus] =
    useState<readonly string[]>([]);

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
        onComplete={(result) => {
          const now = Date.now();
          const conceptCount = Math.max(
            1,
            result.masteryConcepts.length,
          );

          for (const concept of result.masteryConcepts) {
            recordMasteryEvidence({
              source: 'guided-game',
              sourceId: result.scenarioId,
              sourceConcept: concept,
              success: true,
              firstAttempt:
                result.mistakes === 0 &&
                result.helpUses === 0,
              mistakes: result.mistakes,
              hintsUsed: result.helpUses,
              responseMs:
                result.responseMs / conceptCount,
              occurredAt: now,
            });
          }

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
        focusedTags={practiceFocus}
        onExit={() => {
          setPracticeFocus([]);
          setMode('home');
        }}
      />
    );
  }

  if (mode === 'progress') {
    return (
      <MasteryDashboard
        problems={beginnerProblems}
        onExit={() => setMode('home')}
        onPractice={(tags) => {
          setPracticeFocus(tags);
          setMode('practice');
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
          each rule through interaction, then build skill through real games,
          short practice problems, and targeted review.
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
            <>
              <button
                className="home-secondary-action"
                type="button"
                onClick={() => {
                  setPracticeFocus([]);
                  setMode('practice');
                }}
              >
                Practice
              </button>
              <button
                className="home-secondary-action"
                type="button"
                onClick={() => setMode('progress')}
              >
                Progress
              </button>
            </>
          )}
        </div>

        <p className="secondary-copy">
          {practiceUnlocked
            ? 'Lessons · guided game · adaptive practice · mastery diagnosis'
            : '12 interactive lessons · guided first game · no account required'}
        </p>
      </section>
    </main>
  );
}
