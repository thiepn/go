import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import {
  GoBoard,
  triggerBoardFeedback,
  type BoardHighlight,
  type BoardMarker,
} from '../../board';
import {
  getIntersection,
  type Point,
  type Stone,
} from '../../go/engine';
import {
  getAssistanceProfile,
} from '../../guided';
import {
  BOT_PROFILES,
  chooseBotMove,
} from '../bot';
import {
  createClockState,
  formatClock,
} from '../clock';
import {
  getCoachCue,
} from '../coach';
import {
  createGameRecord,
  saveGameRecord,
} from '../records';
import {
  createIndependentGameState,
  reduceIndependentGame,
} from '../runtime';
import {
  boardWithoutDeadStones,
  scoreConfirmedPosition,
} from '../scoring';
import type {
  IndependentGameSettings,
} from '../types';
import './play.css';

export interface IndependentGamePlayerProps {
  readonly settings: IndependentGameSettings;
  readonly onExit?: () => void;
  readonly coachObjective?: string | null;
  readonly exitLabel?: string;
}

function colorLabel(color: Stone): string {
  return color === 'black' ? 'Black' : 'White';
}

function resultText(
  state: ReturnType<typeof createIndependentGameState>,
): string {
  const result = state.result;
  if (!result) return '';

  if (result.type === 'score') {
    if (result.score.winner === 'draw') {
      return 'The game is a draw.';
    }

    return `${colorLabel(result.score.winner)} wins by ${result.score.margin} points.`;
  }

  if (result.type === 'resign') {
    return `${colorLabel(result.winner)} wins by resignation.`;
  }

  return `${colorLabel(result.winner)} wins on time.`;
}

export function IndependentGamePlayer({
  settings,
  onExit,
  coachObjective = null,
  exitLabel = 'Back to Play',
}: IndependentGamePlayerProps) {
  const [state, dispatch] = useReducer(
    reduceIndependentGame,
    settings,
    createIndependentGameState,
  );
  const [clock, setClock] = useState(
    () => createClockState(settings.clock),
  );
  const [showCoach, setShowCoach] = useState(false);
  const [confirmResign, setConfirmResign] = useState(false);
  const savedRef = useRef(false);

  const botThinking =
    state.settings.mode === 'computer' &&
    state.phase === 'playing' &&
    state.game.toPlay !== state.settings.humanColor;

  const humanCanAct =
    state.phase === 'playing' &&
    !botThinking;

  const coachColor =
    state.settings.mode === 'computer'
      ? state.settings.humanColor
      : state.game.toPlay;

  const assistance = getAssistanceProfile(
    state.settings.assistanceLevel,
  );

  const coachCue = useMemo(
    () => getCoachCue(state.game, coachColor),
    [state.game, coachColor],
  );

  const proactiveCoach =
    state.settings.assistanceLevel === 'assisted' &&
    humanCanAct &&
    coachCue.concept !== null;

  const coachVisible =
    state.phase === 'playing' &&
    humanCanAct &&
    (showCoach || proactiveCoach) &&
    state.settings.assistanceLevel !== 'independent';

  const lastMove = useMemo(() => {
    const move = state.game.moves.at(-1);
    return move?.type === 'play' ? move.point : null;
  }, [state.game.moves]);

  const scoringPreview = useMemo(
    () =>
      state.phase === 'scoring'
        ? scoreConfirmedPosition(
            state.game.board,
            state.settings.komi,
            state.deadStones,
          )
        : null,
    [
      state.phase,
      state.game.board,
      state.settings.komi,
      state.deadStones,
    ],
  );

  const displayBoard = useMemo(
    () =>
      state.phase === 'complete' &&
      state.result?.type === 'score'
        ? boardWithoutDeadStones(
            state.game.board,
            state.deadStones,
          )
        : state.game.board,
    [
      state.phase,
      state.result,
      state.game.board,
      state.deadStones,
    ],
  );

  const coachHighlights: BoardHighlight[] =
    coachVisible
      ? coachCue.points.map((point) => ({
          point,
          kind:
            coachCue.concept === 'safety'
              ? 'warning'
              : 'focus',
          pulse: true,
        }))
      : [];

  const deadMarkers: BoardMarker[] =
    state.phase === 'scoring'
      ? state.deadStones.map((point) => ({
          point,
          label: '×',
          tone: 'warning',
        }))
      : [];

  useEffect(() => {
    setShowCoach(false);
    setConfirmResign(false);
  }, [state.game.toPlay, state.phase]);

  useEffect(() => {
    if (!botThinking) return undefined;

    const timer = window.setTimeout(() => {
      const decision = chooseBotMove(
        state.game,
        state.settings.botLevel,
      );

      dispatch({
        type: 'bot',
        decision,
      });

      triggerBoardFeedback(
        decision.type === 'play' ? 'place' : 'focus',
        { haptics: true },
      );
    }, 520);

    return () => window.clearTimeout(timer);
  }, [
    botThinking,
    state.game,
    state.settings.botLevel,
  ]);

  useEffect(() => {
    if (
      state.phase !== 'playing' ||
      settings.clock === 'untimed'
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setClock((current) => {
        const color = state.game.toPlay;
        const remaining = current[color];

        if (remaining === null || remaining <= 0) {
          return current;
        }

        return {
          ...current,
          [color]: Math.max(0, remaining - 1),
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    state.phase,
    state.game.toPlay,
    settings.clock,
  ]);

  useEffect(() => {
    if (state.phase !== 'playing') return;

    const remaining = clock[state.game.toPlay];
    if (remaining !== 0) return;

    dispatch({
      type: 'timeout',
      player: state.game.toPlay,
    });
  }, [
    clock,
    state.phase,
    state.game.toPlay,
  ]);

  useEffect(() => {
    if (
      state.phase !== 'complete' ||
      !state.result ||
      savedRef.current
    ) {
      return;
    }

    const record = createGameRecord(state);
    if (!record) return;

    saveGameRecord(record);
    savedRef.current = true;
  }, [state]);

  const handleBoard = (point: Point) => {
    if (state.phase === 'scoring') {
      if (getIntersection(state.game.board, point) === null) {
        return;
      }

      dispatch({
        type: 'toggle-dead',
        point,
      });
      triggerBoardFeedback('focus', { haptics: true });
      return;
    }

    if (!humanCanAct) return;

    dispatch({
      type: 'play',
      point,
    });
    triggerBoardFeedback('focus', { haptics: true });
  };

  if (state.phase === 'complete' && state.result) {
    const score =
      state.result.type === 'score'
        ? state.result.score
        : null;

    return (
      <main className="independent-result-shell">
        <section className="independent-result">
          <p className="eyebrow">Game complete</p>
          <h1>{resultText(state)}</h1>

          <div className="independent-result__board">
            <GoBoard
              board={displayBoard}
              label="Final Go position"
              lastMove={lastMove}
              showCoordinates={displayBoard.size >= 13}
            />
          </div>

          {score && (
            <div className="independent-result__score">
              <div>
                <span>Black</span>
                <strong>{score.total.black}</strong>
                <small>
                  {score.stones.black} stones · {score.territory.black} territory
                </small>
              </div>
              <div>
                <span>White</span>
                <strong>{score.total.white}</strong>
                <small>
                  {score.stones.white} stones · {score.territory.white} territory · {score.komi} komi
                </small>
              </div>
            </div>
          )}

          <div className="independent-result__meta">
            <span>{state.game.moves.length} moves</span>
            <span>
              Captures {state.game.captures.black}–{state.game.captures.white}
            </span>
            <span>{state.settings.boardSize}×{state.settings.boardSize}</span>
          </div>

          {onExit && (
            <button
              className="primary-action play-result-action"
              type="button"
              onClick={onExit}
            >
              {exitLabel}
            </button>
          )}
        </section>
      </main>
    );
  }

  if (state.phase === 'scoring' && scoringPreview) {
    return (
      <main className="independent-game-shell">
        <header className="independent-game-header">
          <button
            className="lesson-icon-button"
            type="button"
            onClick={onExit}
            aria-label="Leave game"
            disabled={!onExit}
          >
            ×
          </button>
          <div>
            <span>Scoring</span>
            <small>Confirm dead groups</small>
          </div>
          <span className="game-size-label">
            {state.settings.boardSize}×{state.settings.boardSize}
          </span>
        </header>

        <section className="scoring-layout">
          <div className="scoring-copy">
            <p className="eyebrow">After two passes</p>
            <h1>Which stones are dead?</h1>
            <p>
              Tap a dead group to mark it for removal. Tap it again to restore it.
              If you are unsure, resume play and settle the group on the board.
            </p>

            <div className="scoring-preview">
              <div>
                <span>Black</span>
                <strong>{scoringPreview.total.black}</strong>
              </div>
              <div>
                <span>White</span>
                <strong>{scoringPreview.total.white}</strong>
              </div>
            </div>

            <p className="scoring-preview__result">
              {scoringPreview.winner === 'draw'
                ? 'Currently a draw.'
                : `${colorLabel(scoringPreview.winner)} leads by ${scoringPreview.margin}.`}
            </p>

            <div className="scoring-actions">
              <button
                className="primary-action"
                type="button"
                onClick={() =>
                  dispatch({ type: 'confirm-score' })
                }
              >
                Confirm score
              </button>
              <button
                className="secondary-action"
                type="button"
                onClick={() =>
                  dispatch({ type: 'resume-play' })
                }
              >
                Resume play
              </button>
            </div>
          </div>

          <div className="independent-board-stage">
            <GoBoard
              board={state.game.board}
              label="Select dead groups for scoring"
              interactive
              placementColor={state.game.toPlay}
              showPlacementGhost={false}
              lastMove={lastMove}
              markers={deadMarkers}
              showCoordinates={state.game.board.size >= 13}
              onIntersectionIntent={handleBoard}
            />
          </div>
        </section>
      </main>
    );
  }

  const turnColor = state.game.toPlay;
  const currentClock = clock[turnColor];

  return (
    <main className="independent-game-shell">
      <header className="independent-game-header">
        <button
          className="lesson-icon-button"
          type="button"
          onClick={onExit}
          aria-label="Leave game"
          disabled={!onExit}
        >
          ×
        </button>

        <div>
          <span>
            {state.settings.mode === 'computer'
              ? `vs ${BOT_PROFILES[state.settings.botLevel].label}`
              : 'Local game'}
          </span>
          <small>
            {state.settings.boardSize}×{state.settings.boardSize}
            {state.settings.handicap >= 2
              ? ` · ${state.settings.handicap} handicap`
              : ''}
          </small>
        </div>

        <div className="game-turn-chip">
          <span
            className={`game-turn-stone game-turn-stone--${turnColor}`}
            aria-hidden="true"
          />
          {botThinking
            ? 'Computer'
            : `${colorLabel(turnColor)} to play`}
        </div>
      </header>

      <section className="independent-game-layout">
        <aside className="game-side-panel game-side-panel--black">
          <div>
            <span className="game-side-panel__stone game-side-panel__stone--black" />
            <strong>Black</strong>
          </div>
          <span className={turnColor === 'black' ? 'is-active' : ''}>
            {formatClock(clock.black)}
          </span>
          <small>{state.game.captures.black} captures</small>
        </aside>

        <div className="independent-board-stage">
          <GoBoard
            board={state.game.board}
            label="Independent Go game"
            interactive={humanCanAct}
            placementColor={state.game.toPlay}
            lastMove={lastMove}
            highlights={coachHighlights}
            showCoordinates={state.game.board.size >= 13}
            onIntersectionIntent={handleBoard}
          />

          {botThinking && (
            <div className="game-thinking" aria-live="polite">
              Computer is thinking…
            </div>
          )}
        </div>

        <aside className="game-side-panel game-side-panel--white">
          <div>
            <span className="game-side-panel__stone game-side-panel__stone--white" />
            <strong>White</strong>
          </div>
          <span className={turnColor === 'white' ? 'is-active' : ''}>
            {formatClock(clock.white)}
          </span>
          <small>{state.game.captures.white} captures</small>
        </aside>

        <footer className="game-controls">
          <div className="game-controls__status">
            {state.feedback && (
              <span role="status" aria-live="polite">
                {state.feedback}
              </span>
            )}
            {!state.feedback && currentClock !== null && (
              <span>
                {colorLabel(turnColor)} · {formatClock(currentClock)}
              </span>
            )}
          </div>

          <div className="game-controls__actions">
            {assistance.showWhatMatters &&
              state.settings.assistanceLevel !== 'independent' &&
              humanCanAct && (
                <button
                  className="control-chip"
                  type="button"
                  onClick={() => setShowCoach((value) => !value)}
                >
                  {showCoach ? 'Hide hint' : 'What matters?'}
                </button>
              )}

            <button
              className="control-chip"
              type="button"
              disabled={!humanCanAct}
              onClick={() => dispatch({ type: 'pass' })}
            >
              Pass
            </button>

            {!confirmResign ? (
              <button
                className="control-chip"
                type="button"
                disabled={!humanCanAct}
                onClick={() => setConfirmResign(true)}
              >
                Resign
              </button>
            ) : (
              <button
                className="control-chip game-resign-confirm"
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'resign',
                    player:
                      state.settings.mode === 'computer'
                        ? state.settings.humanColor
                        : state.game.toPlay,
                  })
                }
              >
                Confirm resign
              </button>
            )}
          </div>
        </footer>

        {coachObjective && (
          <aside className="game-focus-objective">
            <span>Game focus</span>
            <strong>{coachObjective}</strong>
          </aside>
        )}

        {coachVisible && (
          <aside className="game-coach-card" aria-live="polite">
            <span>Coach</span>
            <strong>{coachCue.title}</strong>
            <p>{coachCue.text}</p>
          </aside>
        )}
      </section>
    </main>
  );
}
