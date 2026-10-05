import { useMemo, useState } from 'react';

import {
  GoBoard,
  triggerBoardFeedback,
  type BoardHighlight,
} from '../board';
import {
  createGame,
  playMove,
  type GameState,
  type IllegalMoveReason,
  type Point,
} from '../go/engine';

function explainIllegalMove(reason: IllegalMoveReason): string {
  switch (reason) {
    case 'occupied':
      return 'There is already a stone on that intersection.';
    case 'suicide':
      return 'That stone would have no liberties after the move.';
    case 'ko':
      return 'That move would immediately repeat a previous board position.';
    case 'out-of-bounds':
      return 'That point is outside the board.';
    case 'game-over':
      return 'This game has already finished.';
  }
}

function freshDemoGame(): GameState {
  return createGame({ size: 9 });
}

export function App() {
  const [started, setStarted] = useState(false);
  const [game, setGame] = useState<GameState>(() => freshDemoGame());
  const [message, setMessage] = useState(
    'Stones are placed where the lines cross.',
  );
  const [showCoordinates, setShowCoordinates] = useState(false);

  const lastMove = useMemo(() => {
    const move = game.moves.at(-1);
    return move?.type === 'play' ? move.point : null;
  }, [game.moves]);

  const firstMoveHighlight: readonly BoardHighlight[] =
    game.moves.length === 0
      ? [
          {
            point: { x: 4, y: 4 },
            kind: 'focus',
            pulse: true,
          },
        ]
      : [];

  const placeStone = (point: Point) => {
    const result = playMove(game, point);

    if (!result.ok) {
      setMessage(explainIllegalMove(result.reason));
      triggerBoardFeedback('invalid', { haptics: true });
      return;
    }

    setGame(result.state);

    if (result.move.type === 'play' && result.move.captured.length > 0) {
      setMessage(
        `${result.move.captured.length} ${result.move.captured.length === 1 ? 'stone' : 'stones'} captured.`,
      );
      triggerBoardFeedback('capture', { haptics: true });
      return;
    }

    setMessage(
      result.state.toPlay === 'black'
        ? 'White is down. Black plays next.'
        : 'Black is down. White plays next.',
    );
    triggerBoardFeedback('place', { haptics: true });
  };

  const reset = () => {
    setGame(freshDemoGame());
    setMessage('Stones are placed where the lines cross.');
  };

  if (!started) {
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

  return (
    <main className="lesson-shell">
      <header className="lesson-header">
        <button
          className="text-action"
          type="button"
          onClick={() => setStarted(false)}
        >
          Back
        </button>
        <div className="lesson-progress" aria-label="Foundation preview">
          <span className="lesson-progress__fill" />
        </div>
        <span className="lesson-step">Board</span>
      </header>

      <section className="board-lesson" aria-labelledby="board-lesson-title">
        <div className="board-lesson__copy">
          <p className="eyebrow">Your first touch</p>
          <h1 id="board-lesson-title">Place a stone.</h1>
          <p className="lesson-instruction">
            Go stones sit on <strong>intersections</strong>—the places where two
            lines cross. Start with the softly marked center point, or explore
            another crossing.
          </p>
          <p className="lesson-feedback" aria-live="polite">
            {message}
          </p>
        </div>

        <div className="board-stage">
          <div className="board-stage__glow" aria-hidden="true" />
          <GoBoard
            board={game.board}
            label="Interactive 9 by 9 Go board"
            interactive
            placementColor={game.toPlay}
            lastMove={lastMove}
            highlights={firstMoveHighlight}
            showCoordinates={showCoordinates}
            onIntersectionIntent={placeStone}
          />
        </div>

        <div className="lesson-controls" aria-label="Board controls">
          <button
            className="control-chip"
            type="button"
            aria-pressed={showCoordinates}
            onClick={() => setShowCoordinates((value) => !value)}
          >
            {showCoordinates ? 'Hide coordinates' : 'Show coordinates'}
          </button>
          <button className="control-chip" type="button" onClick={reset}>
            Reset board
          </button>
        </div>
      </section>
    </main>
  );
}
