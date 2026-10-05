import {
  useMemo,
  useState,
} from 'react';

import {
  buildPracticeQueue,
} from '../queue';
import {
  loadProblemHistory,
  recordProblemSession,
  saveProblemHistory,
} from '../history';
import type {
  ProblemDefinition,
  ProblemHistory,
  ProblemDifficulty,
} from '../types';
import {
  ProblemPlayer,
  type ProblemResult,
} from './ProblemPlayer';

export interface PracticeSessionProps {
  readonly problems: readonly ProblemDefinition[];
  readonly tags?: readonly string[];
  readonly difficulties?: readonly ProblemDifficulty[];
  readonly sessionSize?: number;
  readonly onExit?: () => void;
}

export function PracticeSession({
  problems,
  tags,
  difficulties,
  sessionSize = 6,
  onExit,
}: PracticeSessionProps) {
  const [history, setHistory] = useState<ProblemHistory>(
    () => loadProblemHistory(),
  );

  const initialQueue = useMemo(
    () =>
      buildPracticeQueue(problems, history, {
        tags,
        includeDifficulties: difficulties,
        maxProblems: sessionSize,
      }),
    // A session should remain stable after it starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [queue, setQueue] = useState<ProblemDefinition[]>(
    () => [...initialQueue],
  );
  const [index, setIndex] = useState(0);
  const [repeated, setRepeated] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [cleanSolves, setCleanSolves] = useState(0);

  const current = queue[index];

  const finishProblem = (result: ProblemResult) => {
    const nextHistory = recordProblemSession(history, {
      problemId: result.problemId,
      success: true,
      firstTry: result.firstTry,
      mistakes: result.mistakes,
      hintsUsed: result.hintsUsed,
      attemptedAt: Date.now(),
    });

    setHistory(nextHistory);
    saveProblemHistory(nextHistory);

    if (result.firstTry && result.hintsUsed === 0) {
      setCleanSolves((value) => value + 1);
    }

    if (
      (result.mistakes > 0 || result.hintsUsed > 0) &&
      !repeated.has(result.problemId)
    ) {
      setQueue((items) => [...items, current]);
      setRepeated((ids) => {
        const next = new Set(ids);
        next.add(result.problemId);
        return next;
      });
    }

    setIndex((value) => value + 1);
  };

  if (!current) {
    return (
      <main className="practice-summary-shell">
        <section className="practice-summary" aria-labelledby="practice-summary-title">
          <p className="eyebrow">Practice complete</p>
          <h1 id="practice-summary-title">Good repetition.</h1>
          <p>
            You completed {queue.length} problems. {cleanSolves} were solved
            cleanly without a mistake or hint.
          </p>
          <p className="practice-summary__note">
            Problems that needed help were placed back into the session once.
            Future sessions will also prioritize them.
          </p>
          {onExit && (
            <button
              className="primary-action practice-primary-action"
              type="button"
              onClick={onExit}
            >
              Back home
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <ProblemPlayer
      key={`${current.id}-${index}`}
      problem={current}
      position={{
        current: index + 1,
        total: queue.length,
      }}
      onExit={onExit}
      onSolved={finishProblem}
    />
  );
}
