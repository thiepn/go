import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  fetchKataGoHealth,
  type KataGoHealth,
} from '../../analysis/health';

import {
  loadGameRecords,
} from '../../play/records';
import type {
  SavedGameRecord,
} from '../../play/types';
import { ReviewPlayer } from './ReviewPlayer';
import './review.css';

export interface ReviewHubProps {
  readonly initialRecord?: SavedGameRecord | null;
  readonly onExit?: () => void;
  readonly onPractice?: (
    tags: readonly string[],
  ) => void;
  readonly onStudy?: (
    record: SavedGameRecord,
  ) => void;
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
    ? `${winner} · resignation`
    : `${winner} · time`;
}

export function ReviewHub({
  initialRecord = null,
  onExit,
  onPractice,
  onStudy,
}: ReviewHubProps) {
  const [active, setActive] =
    useState<SavedGameRecord | null>(
      initialRecord,
    );
  const [engineHealth, setEngineHealth] =
    useState<KataGoHealth | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchKataGoHealth().then((health) => {
      if (mounted) {
        setEngineHealth(health);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const games = useMemo(
    () => loadGameRecords(),
    [],
  );

  if (active) {
    return (
      <ReviewPlayer
        record={active}
        onExit={() => setActive(null)}
        onPractice={onPractice}
        onStudy={onStudy}
      />
    );
  }

  return (
    <main className="review-hub-shell">
      <section className="review-hub" aria-labelledby="review-hub-title">
        <header className="review-hub__header">
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
            <p className="eyebrow">Review</p>
            <h1 id="review-hub-title">
              Find the mistakes you can actually explain.
            </h1>
            <p>
              Deterministic review explains concrete tactical facts first.
              KataGo can then add candidate moves, score comparison, ownership,
              policy, and principal variations when the analysis service is connected.
            </p>

            <div className={[
              'review-engine-status',
              engineHealth?.ready
                ? 'is-ready'
                : 'is-offline',
            ].join(' ')}>
              <span aria-hidden="true" />
              {engineHealth === null
                ? 'Checking KataGo…'
                : engineHealth.ready
                  ? `KataGo ready${engineHealth.humanModel ? ' · Human SL available' : ''}`
                  : engineHealth.configured
                    ? 'KataGo configured but unavailable'
                    : 'KataGo optional · not configured'}
            </div>
          </div>
        </header>

        {games.length === 0 ? (
          <section className="review-empty">
            <h2>No independent games yet.</h2>
            <p>
              Finish a game in Play first. Review works from the complete
              move record so every finding can be reconstructed exactly.
            </p>
          </section>
        ) : (
          <section className="review-game-library">
            <div>
              <p className="eyebrow">Your games</p>
              <h2>Choose a game to review</h2>
            </div>

            <div className="review-game-grid">
              {games.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  className="review-game-card"
                  onClick={() =>
                    setActive(record)
                  }
                >
                  <strong>
                    {record.settings.boardSize}×
                    {record.settings.boardSize}
                  </strong>
                  <span>
                    {record.settings.mode === 'computer'
                      ? `vs ${record.settings.botLevel}`
                      : 'Local game'}
                  </span>
                  <small>
                    {record.moves.length} moves
                    {' · '}
                    {new Date(
                      record.playedAt,
                    ).toLocaleDateString()}
                  </small>
                  <em>{resultLabel(record)}</em>
                </button>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
