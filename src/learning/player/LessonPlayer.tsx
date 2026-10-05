import { useMemo } from 'react';

import {
  GoBoard,
  triggerBoardFeedback,
  type BoardHighlight,
  type BoardMarker,
} from '../../board';
import {
  getIntersection,
  type Point,
} from '../../go/engine';
import {
  useLessonRuntime,
  type LessonDefinition,
  type LessonStep,
} from '../runtime';
import './lesson-player.css';

export interface LessonPlayerProps {
  readonly lesson: LessonDefinition;
  readonly onExit?: () => void;
  readonly onComplete?: () => void;
}

function isPointInteractive(step: LessonStep | undefined): boolean {
  if (!step) return false;

  return (
    step.kind === 'play-move' ||
    step.kind === 'select-points' ||
    step.kind === 'select-stones' ||
    step.kind === 'select-group' ||
    step.kind === 'mark-liberties' ||
    step.kind === 'identify-territory' ||
    step.kind === 'predict-move' ||
    step.kind === 'predict-sequence'
  );
}

function selectedHighlights(
  step: LessonStep | undefined,
  points: readonly Point[],
): BoardHighlight[] {
  if (
    !step ||
    (step.kind !== 'select-points' &&
      step.kind !== 'select-stones' &&
      step.kind !== 'mark-liberties' &&
      step.kind !== 'identify-territory')
  ) {
    return [];
  }

  return points.map((point) => ({
    point,
    kind: step.kind === 'mark-liberties' ? 'liberty' : 'selected',
  }));
}

function sequenceMarkers(
  step: LessonStep | undefined,
  points: readonly Point[],
): BoardMarker[] {
  if (step?.kind !== 'predict-sequence') return [];

  return points.map((point, index) => ({
    point,
    label: String(index + 1),
    tone: 'accent',
  }));
}

function actionLabel(step: LessonStep | undefined): string | null {
  if (!step) return null;

  switch (step.kind) {
    case 'continue':
      return 'Continue';
    case 'play-move':
      return 'Play on the board';
    case 'select-points':
      return 'Select the points';
    case 'select-stones':
      return 'Select the stones';
    case 'select-group':
      return 'Select the group';
    case 'mark-liberties':
      return 'Mark every liberty';
    case 'identify-territory':
      return 'Mark the territory';
    case 'choose-answer':
      return 'Choose an answer';
    case 'predict-move':
      return 'Choose the move';
    case 'predict-sequence':
      return 'Read the sequence';
  }
}

export function LessonPlayer({
  lesson,
  onExit,
  onComplete,
}: LessonPlayerProps) {
  const {
    state,
    step,
    progress,
    dispatch,
  } = useLessonRuntime(lesson);

  const lastMove = useMemo(() => {
    const move = state.board.moves.at(-1);
    return move?.type === 'play' ? move.point : null;
  }, [state.board.moves]);

  const dynamicHighlights = useMemo(
    () => selectedHighlights(step, state.selectedPoints),
    [step, state.selectedPoints],
  );

  const dynamicMarkers = useMemo(
    () => sequenceMarkers(step, state.sequence),
    [step, state.sequence],
  );

  const highlights = [
    ...state.presentation.highlights,
    ...dynamicHighlights,
  ];

  const markers = [
    ...state.presentation.markers,
    ...dynamicMarkers,
  ];

  const handlePoint = (point: Point) => {
    if (!step || !isPointInteractive(step)) return;

    if (
      step.kind === 'select-stones' ||
      step.kind === 'select-group'
    ) {
      if (getIntersection(state.board.board, point) === null) {
        triggerBoardFeedback('invalid', { haptics: true });
      }
    }

    dispatch({ type: 'point', point });
    triggerBoardFeedback('focus', { haptics: true });
  };

  if (state.completed) {
    return (
      <main className="lesson-player lesson-player--complete">
        <section className="lesson-complete" aria-labelledby="lesson-complete-title">
          <div className="lesson-complete__stones" aria-hidden="true">
            <span />
            <span />
          </div>
          <p className="eyebrow">Lesson complete</p>
          <h1 id="lesson-complete-title">{lesson.title}</h1>
          <p>
            {state.feedback?.text ?? 'You completed this lesson.'}
          </p>
          <div className="lesson-complete__actions">
            {onExit && (
              <button className="secondary-action" type="button" onClick={onExit}>
                Back
              </button>
            )}
            {onComplete && (
              <button
                className="primary-action lesson-primary-action"
                type="button"
                onClick={onComplete}
              >
                Continue course
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (!step) {
    return null;
  }

  const hasHints = (step.hints?.length ?? 0) > 0;
  const canRewind = state.history.length > 0;
  const pointInteraction = isPointInteractive(step);
  const progressPercent = Math.max(4, Math.round(progress * 100));

  return (
    <main className="lesson-player">
      <header className="lesson-player__header">
        <button
          className="lesson-icon-button"
          type="button"
          onClick={onExit}
          aria-label="Leave lesson"
          disabled={!onExit}
        >
          ×
        </button>

        <div
          className="lesson-player__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          aria-label="Lesson progress"
        >
          <span style={{ width: `${progressPercent}%` }} />
        </div>

        <span className="lesson-player__count">
          {state.stepIndex + 1}/{lesson.steps.length}
        </span>
      </header>

      <section className="lesson-player__body" aria-labelledby="lesson-step-title">
        <div className="lesson-player__copy">
          <p className="eyebrow">{actionLabel(step)}</p>
          <h1 id="lesson-step-title">{step.title}</h1>
          <p className="lesson-player__instruction">{step.instruction}</p>

          {state.feedback && (
            <div
              className={`lesson-feedback-card lesson-feedback-card--${state.feedback.tone}`}
              role="status"
              aria-live="polite"
            >
              {state.feedback.text}
            </div>
          )}

          {step.kind === 'choose-answer' && (
            <div className="lesson-choices">
              {step.choices.map((choice) => (
                <button
                  key={choice.id}
                  className="lesson-choice"
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'choice',
                      choiceId: choice.id,
                    })
                  }
                >
                  {choice.label}
                </button>
              ))}
            </div>
          )}

          {step.kind === 'continue' && (
            <button
              className="primary-action lesson-primary-action"
              type="button"
              onClick={() => dispatch({ type: 'continue' })}
            >
              Continue
            </button>
          )}
        </div>

        <div className="lesson-player__board-stage">
          <div className="board-stage__glow" aria-hidden="true" />
          <GoBoard
            board={state.board.board}
            label={`${lesson.title}: ${step.title}`}
            interactive={pointInteraction}
            placementColor={state.board.toPlay}
            lastMove={lastMove}
            highlights={highlights}
            groupHighlights={state.presentation.groupHighlights}
            markers={markers}
            ghostStone={state.presentation.ghostStone}
            onIntersectionIntent={handlePoint}
          />
        </div>

        <footer className="lesson-player__tools">
          <div className="lesson-player__tools-left">
            {canRewind && (
              <button
                className="control-chip"
                type="button"
                onClick={() => dispatch({ type: 'rewind' })}
              >
                Back one step
              </button>
            )}

            {(state.selectedPoints.length > 0 ||
              state.sequence.length > 0 ||
              state.feedback?.tone === 'correction') && (
              <button
                className="control-chip"
                type="button"
                onClick={() => dispatch({ type: 'retry' })}
              >
                Try again
              </button>
            )}
          </div>

          {hasHints && (
            <button
              className="hint-action"
              type="button"
              onClick={() => dispatch({ type: 'hint' })}
            >
              Hint
              {state.hintIndex > 0 && (
                <span>
                  {Math.min(state.hintIndex, step.hints?.length ?? 0)}/
                  {step.hints?.length ?? 0}
                </span>
              )}
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}
