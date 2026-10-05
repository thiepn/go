import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import {
  GoBoard,
  triggerBoardFeedback,
  type BoardHighlight,
  type BoardMarker,
} from '../../board';
import type { Point } from '../../go/engine';
import {
  createProblemState,
  reduceProblem,
} from '../runtime';
import type { ProblemDefinition } from '../types';
import './practice.css';

export interface ProblemResult {
  readonly problemId: string;
  readonly firstTry: boolean;
  readonly mistakes: number;
  readonly hintsUsed: number;
  readonly responseMs: number;
}

export interface ProblemPlayerProps {
  readonly problem: ProblemDefinition;
  readonly position: {
    readonly current: number;
    readonly total: number;
  };
  readonly onExit?: () => void;
  readonly onSolved: (result: ProblemResult) => void;
}

export function ProblemPlayer({
  problem,
  position,
  onExit,
  onSolved,
}: ProblemPlayerProps) {
  const startedAtRef = useRef(Date.now());

  const [state, dispatch] = useReducer(
    (
      current: ReturnType<typeof createProblemState>,
      action: Parameters<typeof reduceProblem>[2],
    ) => reduceProblem(problem, current, action),
    problem,
    createProblemState,
  );

  useEffect(() => {
    if (!state.pendingOpponent) return undefined;

    const timer = window.setTimeout(() => {
      dispatch({ type: 'opponent' });
      triggerBoardFeedback('place', { haptics: true });
    }, 440);

    return () => window.clearTimeout(timer);
  }, [state.pendingOpponent]);

  const lastMove = useMemo(() => {
    const move = state.game.moves.at(-1);
    return move?.type === 'play' ? move.point : null;
  }, [state.game.moves]);

  const hints = problem.hints ?? [];
  const hint = state.hintIndex > 0
    ? hints[Math.min(state.hintIndex, hints.length) - 1]
    : undefined;

  const highlights: BoardHighlight[] = (hint?.showPoints ?? []).map(
    (point) => ({
      point,
      kind: 'focus',
      pulse: true,
    }),
  );

  const markers: BoardMarker[] = state.refutation.map((point, index) => ({
    point,
    label: String(index + 1),
    tone: 'warning',
  }));

  const handlePoint = (point: Point) => {
    if (state.pendingOpponent || state.completed) return;

    dispatch({ type: 'play', point });
    triggerBoardFeedback('focus', { haptics: true });
  };

  if (state.completed) {
    return (
      <main className="problem-shell problem-shell--solved">
        <section className="problem-result" aria-labelledby="problem-result-title">
          <div className="problem-result__mark" aria-hidden="true">✓</div>
          <p className="eyebrow">
            {state.firstTry && state.hintsUsed === 0 ? 'First try' : 'Solved'}
          </p>
          <h1 id="problem-result-title">{problem.title}</h1>
          <p>
            {state.feedback?.text ?? 'Correct.'}
          </p>

          <div className="problem-result__stats">
            <span>
              {state.attempts === 0
                ? 'No mistakes'
                : `${state.attempts} ${state.attempts === 1 ? 'mistake' : 'mistakes'}`}
            </span>
            <span>
              {state.hintsUsed === 0
                ? 'No hints'
                : `${state.hintsUsed} ${state.hintsUsed === 1 ? 'hint' : 'hints'}`}
            </span>
          </div>

          <button
            className="primary-action practice-primary-action"
            type="button"
            onClick={() =>
              onSolved({
                problemId: problem.id,
                firstTry: state.firstTry,
                mistakes: state.attempts,
                hintsUsed: state.hintsUsed,
                responseMs: Math.max(0, Date.now() - startedAtRef.current),
              })
            }
          >
            Next problem
          </button>
        </section>
      </main>
    );
  }

  const prompt = state.node.prompt ?? problem.instruction;
  const hasHints = (problem.hints?.length ?? 0) > 0;

  return (
    <main className="problem-shell">
      <header className="problem-header">
        <button
          className="lesson-icon-button"
          type="button"
          onClick={onExit}
          aria-label="Leave practice"
          disabled={!onExit}
        >
          ×
        </button>

        <div className="problem-header__meta">
          <span>Practice</span>
          <small>{position.current}/{position.total}</small>
        </div>

        <div
          className="problem-difficulty"
          aria-label={`Difficulty ${problem.difficulty} of 5`}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={index < problem.difficulty ? 'is-filled' : ''}
            />
          ))}
        </div>
      </header>

      <section className="problem-layout">
        <div className="problem-copy">
          <div className="problem-tags">
            {problem.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <h1>{problem.title}</h1>
          <p className="problem-instruction">{prompt}</p>

          {state.feedback && (
            <div
              className={`lesson-feedback-card lesson-feedback-card--${state.feedback.tone}`}
              role="status"
              aria-live="polite"
            >
              {state.feedback.text}
            </div>
          )}

          {state.pendingOpponent && (
            <p className="problem-opponent" aria-live="polite">
              Opponent is replying…
            </p>
          )}
        </div>

        <div className="problem-board-stage">
          <div className="board-stage__glow" aria-hidden="true" />
          <GoBoard
            board={state.game.board}
            label={`Practice problem: ${problem.title}`}
            interactive={!state.pendingOpponent}
            placementColor={state.game.toPlay}
            lastMove={lastMove}
            highlights={highlights}
            markers={markers}
            onIntersectionIntent={handlePoint}
          />
        </div>

        <footer className="problem-tools">
          <div className="problem-tools__left">
            {(state.attempts > 0 || state.hintsUsed > 0) && (
              <button
                className="control-chip"
                type="button"
                onClick={() => dispatch({ type: 'retry' })}
              >
                Reset position
              </button>
            )}
          </div>

          {hasHints && (
            <button
              className="hint-action"
              type="button"
              disabled={Boolean(state.pendingOpponent)}
              onClick={() => dispatch({ type: 'hint' })}
            >
              Hint
              {state.hintIndex > 0 && (
                <span>
                  {Math.min(state.hintIndex, problem.hints?.length ?? 0)}/
                  {problem.hints?.length ?? 0}
                </span>
              )}
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}
