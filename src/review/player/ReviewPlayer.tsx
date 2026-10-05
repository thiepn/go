import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { EngineMoveAnalysis } from '../../analysis/player';
import {
  GoBoard,
  type BoardHighlight,
  type BoardMarker,
} from '../../board';
import {
  playMove,
  type GameState,
  type Point,
} from '../../go/engine';
import {
  getConcept,
} from '../../mastery/graph';
import type {
  SavedGameRecord,
} from '../../play/types';
import {
  reviewSavedGame,
} from '../analyze';
import {
  syncReviewMasteryEvidence,
} from '../mastery';
import type {
  ReviewFinding,
} from '../types';
import './review.css';

export interface ReviewPlayerProps {
  readonly record: SavedGameRecord;
  readonly onExit?: () => void;
  readonly onPractice?: (
    tags: readonly string[],
  ) => void;
  readonly onStudy?: (
    record: SavedGameRecord,
  ) => void;
}

function severityLabel(
  finding: ReviewFinding,
): string {
  if (finding.severity === 'mistake') {
    return 'Mistake';
  }
  if (finding.severity === 'warning') {
    return 'Check this';
  }
  return 'Opportunity';
}

function resultLabel(
  record: SavedGameRecord,
): string {
  if (record.result.type === 'score') {
    if (record.result.score.winner === 'draw') {
      return 'Draw';
    }

    return `${record.result.score.winner === 'black' ? 'Black' : 'White'} +${record.result.score.margin}`;
  }

  const winner =
    record.result.winner === 'black'
      ? 'Black'
      : 'White';

  return record.result.type === 'resign'
    ? `${winner} by resignation`
    : `${winner} on time`;
}

function samePoint(
  a: Point,
  b: Point,
): boolean {
  return a.x === b.x && a.y === b.y;
}

export function ReviewPlayer({
  record,
  onExit,
  onPractice,
  onStudy,
}: ReviewPlayerProps) {
  const review = useMemo(
    () => reviewSavedGame(record),
    [record],
  );
  const [findingIndex, setFindingIndex] =
    useState(0);
  const [showAfter, setShowAfter] =
    useState(false);
  const [showIdea, setShowIdea] =
    useState(false);
  const [tryMode, setTryMode] =
    useState(false);
  const [tryState, setTryState] =
    useState<GameState | null>(null);
  const [tryPoint, setTryPoint] =
    useState<Point | null>(null);
  const [tryFeedback, setTryFeedback] =
    useState<string | null>(null);

  const reviewableMoveNumbers = useMemo(
    () =>
      record.moves.flatMap((move, index) =>
        record.settings.mode === 'computer' &&
        move.player !== record.settings.humanColor
          ? []
          : [index + 1],
      ),
    [record],
  );

  const [cleanEngineMove, setCleanEngineMove] =
    useState(
      () =>
        reviewableMoveNumbers.at(-1) ??
        1,
    );

  useEffect(() => {
    syncReviewMasteryEvidence(review);
  }, [review]);

  const finding =
    review.findings[findingIndex] ?? null;

  const frame = finding
    ? review.frames.find(
        (item) =>
          item.moveNumber ===
          finding.moveNumber,
      ) ?? null
    : null;

  useEffect(() => {
    setShowAfter(false);
    setShowIdea(false);
    setTryMode(false);
    setTryState(null);
    setTryPoint(null);
    setTryFeedback(null);
  }, [findingIndex]);

  if (!finding || !frame) {
    return (
      <main className="review-clean-shell">
        <section className="review-clean">
          <p className="eyebrow">Game review</p>
          <h1>No deterministic tactical issue found.</h1>
          <p>
            That does not mean every move was strong. Deterministic review
            only reports rule-based patterns it can explain safely. You can
            still inspect any of your moves with KataGo below.
          </p>

          <div className="review-clean__meta">
            <span>
              {record.settings.boardSize}×
              {record.settings.boardSize}
            </span>
            <span>{record.moves.length} moves</span>
            <span>{resultLabel(record)}</span>
          </div>

          {reviewableMoveNumbers.length > 0 && (
            <div className="review-clean__engine-picker">
              <label htmlFor="review-clean-engine-move">
                Engine-check move
              </label>
              <select
                id="review-clean-engine-move"
                value={cleanEngineMove}
                onChange={(event) =>
                  setCleanEngineMove(
                    Number(event.target.value),
                  )
                }
              >
                {reviewableMoveNumbers.map(
                  (moveNumber) => {
                    const move =
                      record.moves[
                        moveNumber - 1
                      ];

                    return (
                      <option
                        key={moveNumber}
                        value={moveNumber}
                      >
                        Move {moveNumber} ·{' '}
                        {move.player ===
                        'black'
                          ? 'Black'
                          : 'White'}
                      </option>
                    );
                  },
                )}
              </select>
            </div>
          )}

          {reviewableMoveNumbers.length > 0 && (
            <EngineMoveAnalysis
              key={`${record.id}-clean-${cleanEngineMove}`}
              record={record}
              moveNumber={cleanEngineMove}
            />
          )}

          <div className="review-clean__actions">
            {onStudy && (
              <button
                className="secondary-action"
                type="button"
                onClick={() => onStudy(record)}
              >
                Open in Study
              </button>
            )}
            {onExit && (
              <button
                className="primary-action"
                type="button"
                onClick={onExit}
              >
                Back to Review
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  const concept =
    getConcept(finding.conceptId);
  const board =
    tryState?.board ??
    (showAfter
      ? frame.after.board
      : frame.before.board);

  const highlights: BoardHighlight[] = [
    ...finding.highlightPoints.map(
      (point) => ({
        point,
        kind: 'warning' as const,
        pulse: !showAfter,
      }),
    ),
    ...(showIdea || tryMode
      ? finding.alternativePoints.map(
          (point) => ({
            point,
            kind: 'focus' as const,
            pulse: true,
          }),
        )
      : []),
  ];

  const markers: BoardMarker[] = [];

  if (
    finding.actualMove &&
    !tryState
  ) {
    markers.push({
      point: finding.actualMove,
      label: '!',
      tone: 'warning',
    });
  }

  if (tryPoint) {
    markers.push({
      point: tryPoint,
      label: '✓',
      tone: 'accent',
    });
  }

  const handleTry = (point: Point) => {
    if (!tryMode) return;

    const result = playMove(
      frame.before,
      point,
    );

    if (!result.ok) {
      setTryFeedback(
        result.reason === 'occupied'
          ? 'There is already a stone there.'
          : result.reason === 'suicide'
            ? 'That move is suicide in this position.'
            : result.reason === 'ko'
              ? 'Ko prevents that move.'
              : 'That move is not legal here.',
      );
      return;
    }

    setTryState(result.state);
    setTryPoint(point);

    const addressesFinding =
      finding.alternativePoints.some(
        (candidate) =>
          samePoint(candidate, point),
      );

    setTryFeedback(
      addressesFinding
        ? 'This directly addresses the tactical issue highlighted by the review.'
        : 'That is a legal alternative. It does not match the deterministic remedy P10 identified, but you can explore it further in Study.',
    );
  };

  const severityClass =
    `review-finding--${finding.severity}`;

  return (
    <main className="review-player-shell">
      <header className="review-player-header">
        <button
          className="lesson-icon-button"
          type="button"
          onClick={onExit}
          aria-label="Leave review"
          disabled={!onExit}
        >
          ×
        </button>

        <div>
          <span>Game review</span>
          <strong>
            {record.settings.boardSize}×
            {record.settings.boardSize}
            {' · '}
            {resultLabel(record)}
          </strong>
        </div>

        <div className="review-counter">
          {findingIndex + 1}/
          {review.findings.length}
        </div>
      </header>

      <section className="review-player-layout">
        <div className="review-copy">
          <div className="review-summary-strip">
            <span>
              {review.mistakeCount} mistakes
            </span>
            <span>
              {review.warningCount} checks
            </span>
            <span>
              {review.opportunityCount} opportunities
            </span>
          </div>

          <article
            className={[
              'review-finding',
              severityClass,
            ].join(' ')}
          >
            <div className="review-finding__meta">
              <span>
                Move {finding.moveNumber}
              </span>
              <strong>
                {severityLabel(finding)}
              </strong>
              <small>
                {finding.confidence} confidence
              </small>
            </div>

            <h1>{finding.title}</h1>
            <p className="review-finding__summary">
              {finding.summary}
            </p>
            <p className="review-finding__explanation">
              {finding.explanation}
            </p>

            <div className="review-concept-chip">
              <span>Concept</span>
              <strong>
                {concept?.title ??
                  finding.conceptId}
              </strong>
            </div>
          </article>

          {tryFeedback && (
            <div
              className="review-try-feedback"
              role="status"
            >
              {tryFeedback}
            </div>
          )}

          <div className="review-actions">
            {finding.alternativePoints.length >
              0 && (
              <button
                className="secondary-action"
                type="button"
                onClick={() => {
                  setShowIdea((value) => !value);
                  setTryMode(false);
                  setTryState(null);
                  setTryPoint(null);
                  setTryFeedback(null);
                }}
              >
                {showIdea
                  ? 'Hide idea'
                  : 'Show better idea'}
              </button>
            )}

            <button
              className="secondary-action"
              type="button"
              onClick={() => {
                setTryMode((value) => !value);
                setShowIdea(true);
                setTryState(null);
                setTryPoint(null);
                setTryFeedback(null);
                setShowAfter(false);
              }}
            >
              {tryMode
                ? 'Stop trying'
                : 'Try another move'}
            </button>

            {onPractice &&
              finding.practiceTags.length >
                0 && (
                <button
                  className="primary-action"
                  type="button"
                  onClick={() =>
                    onPractice(
                      finding.practiceTags,
                    )
                  }
                >
                  Practice this
                </button>
              )}
          </div>
        </div>

        <div className="review-board-column">
          <div className="review-board-toolbar">
            <button
              type="button"
              className={
                !showAfter && !tryMode
                  ? 'is-active'
                  : ''
              }
              disabled={tryMode}
              onClick={() =>
                setShowAfter(false)
              }
            >
              Before
            </button>
            <button
              type="button"
              className={
                showAfter && !tryMode
                  ? 'is-active'
                  : ''
              }
              disabled={tryMode}
              onClick={() =>
                setShowAfter(true)
              }
            >
              After
            </button>
            {tryMode && (
              <span>Try a legal move</span>
            )}
          </div>

          <div className="review-board-stage">
            <GoBoard
              board={board}
              label={`Review move ${finding.moveNumber}`}
              interactive={tryMode}
              placementColor={
                frame.before.toPlay
              }
              lastMove={
                tryPoint ??
                (showAfter &&
                frame.move.type === 'play'
                  ? frame.move.point
                  : null)
              }
              highlights={highlights}
              markers={markers}
              showCoordinates={
                board.size >= 13
              }
              onIntersectionIntent={
                handleTry
              }
            />
          </div>

          {tryState && (
            <button
              className="control-chip review-reset-try"
              type="button"
              onClick={() => {
                setTryState(null);
                setTryPoint(null);
                setTryFeedback(null);
              }}
            >
              Try a different move
            </button>
          )}
        </div>

        <aside className="review-findings-list">
          <div className="review-findings-list__heading">
            <span className="play-setting-label">
              Important moments
            </span>
            <small>
              {review.findings.length}
            </small>
          </div>

          <div className="review-findings-list__items">
            {review.findings.map(
              (item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    index === findingIndex
                      ? 'is-active'
                      : '',
                    `is-${item.severity}`,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() =>
                    setFindingIndex(index)
                  }
                >
                  <span>
                    Move {item.moveNumber}
                  </span>
                  <strong>
                    {item.title}
                  </strong>
                  <small>
                    {severityLabel(item)}
                  </small>
                </button>
              ),
            )}
          </div>

          <div className="review-list-actions">
            <button
              className="control-chip"
              type="button"
              disabled={findingIndex === 0}
              onClick={() =>
                setFindingIndex((value) =>
                  Math.max(0, value - 1),
                )
              }
            >
              ← Previous
            </button>
            <button
              className="control-chip"
              type="button"
              disabled={
                findingIndex >=
                review.findings.length - 1
              }
              onClick={() =>
                setFindingIndex((value) =>
                  Math.min(
                    review.findings.length - 1,
                    value + 1,
                  ),
                )
              }
            >
              Next →
            </button>
          </div>

          {onStudy && (
            <button
              className="secondary-action review-study-action"
              type="button"
              onClick={() => onStudy(record)}
            >
              Open full game in Study
            </button>
          )}
        </aside>
      </section>

      <div className="review-engine-wide">
        <EngineMoveAnalysis
          key={`${record.id}-finding-${finding.moveNumber}`}
          record={record}
          moveNumber={finding.moveNumber}
          deterministicFinding={finding}
        />
      </div>
    </main>
  );
}
