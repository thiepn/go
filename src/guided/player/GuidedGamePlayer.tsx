import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import {
  GoBoard,
  triggerBoardFeedback,
} from '../../board';
import { type Point } from '../../go/engine';
import { getAssistanceProfile } from '../assistance';
import { inspectPosition } from '../analysis';
import { guidedPresentation } from '../presentation';
import {
  createGuidedGameState,
  reduceGuidedGame,
} from '../runtime';
import type { GuidedGameScenario } from '../types';
import './guided-game.css';

export interface GuidedGameCompletionResult {
  readonly scenarioId: string;
  readonly masteryConcepts: readonly string[];
  readonly learnerMoves: number;
  readonly helpUses: number;
  readonly mistakes: number;
  readonly captures: number;
  readonly responseMs: number;
}

export interface GuidedGamePlayerProps {
  readonly scenario: GuidedGameScenario;
  readonly onExit?: () => void;
  readonly onComplete?: (result: GuidedGameCompletionResult) => void;
}

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function GuidedGamePlayer({
  scenario,
  onExit,
  onComplete,
}: GuidedGamePlayerProps) {
  const startedAtRef = useRef(Date.now());

  const [state, dispatch] = useReducer(
    (
      current: ReturnType<typeof createGuidedGameState>,
      action: Parameters<typeof reduceGuidedGame>[2],
    ) => reduceGuidedGame(scenario, current, action),
    scenario,
    createGuidedGameState,
  );

  const turn = scenario.turns[state.turnIndex];
  const profile = getAssistanceProfile(scenario.assistanceLevel);
  const presentation = guidedPresentation(scenario, state);
  const signals = useMemo(
    () => inspectPosition(state.game, 'black'),
    [state.game],
  );

  const lastMove = useMemo(() => {
    const move = state.game.moves.at(-1);
    return move?.type === 'play' ? move.point : null;
  }, [state.game.moves]);

  useEffect(() => {
    if (!state.pendingOpponent) return undefined;

    const timer = window.setTimeout(() => {
      dispatch({ type: 'opponent' });
      triggerBoardFeedback(
        state.pendingOpponent?.type === 'play' ? 'place' : 'focus',
        { haptics: true },
      );
    }, 520);

    return () => window.clearTimeout(timer);
  }, [state.pendingOpponent]);

  const handlePoint = (point: Point) => {
    if (!turn || turn.type !== 'play' || state.pendingOpponent) return;

    dispatch({ type: 'play', point });
    triggerBoardFeedback('focus', { haptics: true });
  };

  if (state.completed && state.score) {
    const score = state.score;
    const winner =
      score.winner === 'draw'
        ? 'The game is a draw.'
        : `${score.winner === 'black' ? 'Black' : 'White'} wins by ${formatScore(score.margin)} points.`;

    return (
      <main className="guided-complete-shell">
        <section className="guided-complete" aria-labelledby="guided-complete-title">
          <p className="eyebrow">First game complete</p>
          <h1 id="guided-complete-title">You played a complete 9×9 game.</h1>
          <p className="guided-complete__lead">
            {scenario.completionMessage}
          </p>

          <div className="guided-complete__result">
            <strong>{winner}</strong>
            <div className="guided-score-grid">
              <div>
                <span>Black</span>
                <strong>{formatScore(score.total.black)}</strong>
                <small>
                  {score.stones.black} stones + {score.territory.black} territory
                </small>
              </div>
              <div>
                <span>White</span>
                <strong>{formatScore(score.total.white)}</strong>
                <small>
                  {score.stones.white} stones + {score.territory.white} territory + {formatScore(score.komi)} komi
                </small>
              </div>
            </div>
            <p>
              Winning was not the lesson. Finishing the game correctly was.
              You built territory, captured a stone, recognized the end, passed,
              and reached a real score.
            </p>
          </div>

          <div className="guided-complete__stats">
            <span>{state.learnerMoves} learner turns</span>
            <span>{state.helpUses} help requests</span>
            <span>{state.mistakes} corrections</span>
            <span>{state.game.captures.black} capture</span>
          </div>

          <div className="guided-complete__actions">
            {onExit && (
              <button className="secondary-action" type="button" onClick={onExit}>
                Back home
              </button>
            )}
            {onComplete && (
              <button
                className="primary-action guided-primary-action"
                type="button"
                onClick={() =>
                  onComplete({
                    scenarioId: scenario.id,
                    masteryConcepts: scenario.masteryConcepts ?? [],
                    learnerMoves: state.learnerMoves,
                    helpUses: state.helpUses,
                    mistakes: state.mistakes,
                    captures: state.game.captures.black,
                    responseMs: Math.max(0, Date.now() - startedAtRef.current),
                  })
                }
              >
                Continue
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (!turn) return null;

  const turnNumber = state.turnIndex + 1;
  const captureAvailable = signals.captureMoves.length > 0;
  const learnerInDanger = signals.learnerAtariGroups.length > 0;

  return (
    <main className="guided-game-shell">
      <header className="guided-header">
        <button
          className="lesson-icon-button"
          type="button"
          onClick={onExit}
          aria-label="Leave guided game"
          disabled={!onExit}
        >
          ×
        </button>

        <div className="guided-title">
          <span>{scenario.title}</span>
          <small>Turn {turnNumber}/{scenario.turns.length}</small>
        </div>

        <div className="guided-captures" aria-label="Black captures">
          <span className="guided-captures__stone" aria-hidden="true" />
          {state.game.captures.black}
        </div>
      </header>

      <section className="guided-layout">
        <div className="guided-copy">
          <p className="eyebrow">
            {state.pendingOpponent ? 'White is replying' : 'Black to play'}
          </p>
          <h1>{turn.title}</h1>
          <p className="guided-prompt">{turn.prompt}</p>

          {state.feedback && (
            <div
              className={`lesson-feedback-card lesson-feedback-card--${state.feedback.tone}`}
              role="status"
              aria-live="polite"
            >
              {state.feedback.text}
            </div>
          )}

          {(learnerInDanger || captureAvailable) && !state.pendingOpponent && (
            <div className="guided-signal" role="status">
              {learnerInDanger
                ? 'Your group is in atari. Check its last liberty before playing elsewhere.'
                : 'There is a capture available in this position.'}
            </div>
          )}

          {presentation.helpText && (
            <div className="guided-help-card">
              <span>{presentation.helpTitle}</span>
              <p>{presentation.helpText}</p>
              <button
                type="button"
                onClick={() => dispatch({ type: 'clear-help' })}
              >
                Got it
              </button>
            </div>
          )}

          {turn.type === 'pass' && !state.pendingOpponent && (
            <button
              className="primary-action guided-primary-action"
              type="button"
              onClick={() => {
                dispatch({ type: 'pass' });
                triggerBoardFeedback('focus', { haptics: true });
              }}
            >
              Pass
            </button>
          )}
        </div>

        <div className="guided-board-stage">
          <div className="board-stage__glow" aria-hidden="true" />
          <GoBoard
            board={state.game.board}
            label="First guided 9 by 9 Go game"
            interactive={turn.type === 'play' && !state.pendingOpponent}
            placementColor={state.game.toPlay}
            lastMove={lastMove}
            highlights={presentation.highlights}
            markers={presentation.markers}
            ghostStone={presentation.ghostStone}
            onIntersectionIntent={handlePoint}
          />
          {state.pendingOpponent && (
            <div className="guided-thinking" aria-live="polite">
              White is playing…
            </div>
          )}
        </div>

        <footer className="guided-tools" aria-label="Teaching help">
          {profile.showWhatMatters && (
            <button
              type="button"
              className="guided-tool"
              disabled={Boolean(state.pendingOpponent)}
              onClick={() =>
                dispatch({ type: 'help', mode: 'what-matters' })
              }
            >
              What matters?
            </button>
          )}
          {profile.showMe && (
            <button
              type="button"
              className="guided-tool"
              disabled={Boolean(state.pendingOpponent)}
              onClick={() =>
                dispatch({ type: 'help', mode: 'show-me' })
              }
            >
              Show me
            </button>
          )}
          {profile.why && (
            <button
              type="button"
              className="guided-tool"
              disabled={Boolean(state.pendingOpponent)}
              onClick={() =>
                dispatch({ type: 'help', mode: 'why' })
              }
            >
              Why?
            </button>
          )}
          {profile.sequence && (
            <button
              type="button"
              className="guided-tool"
              disabled={Boolean(state.pendingOpponent)}
              onClick={() =>
                dispatch({ type: 'help', mode: 'sequence' })
              }
            >
              Show the sequence
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}
