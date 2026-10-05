import {
  useMemo,
  useState,
} from 'react';

import {
  GoBoard,
  type BoardMarker,
} from '../../board';
import type {
  SavedGameRecord,
} from '../../play/types';
import {
  buildReviewFrames,
} from '../../review/replay';
import type {
  ReviewFinding,
} from '../../review/types';
import {
  analyzeSavedGameMove,
} from '../review';
import {
  defaultKataGoProvider,
} from '../provider';
import {
  translateKataGoMoveReview,
} from '../translate';
import type {
  KataGoMoveReview,
} from '../types';

export interface EngineMoveAnalysisProps {
  readonly record: SavedGameRecord;
  readonly moveNumber: number;
  readonly deterministicFinding?: ReviewFinding | null;
}

function percent(
  value: number | null,
): string {
  return value === null
    ? '—'
    : `${Math.round(value * 100)}%`;
}

function points(
  value: number | null,
): string {
  if (value === null) return '—';

  const rounded =
    Math.round(value * 10) / 10;

  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1);
}

export function EngineMoveAnalysis({
  record,
  moveNumber,
  deterministicFinding = null,
}: EngineMoveAnalysisProps) {
  const [analysis, setAnalysis] =
    useState<KataGoMoveReview | null>(null);
  const [state, setState] =
    useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] =
    useState<string | null>(null);
  const [showOwnership, setShowOwnership] =
    useState(true);
  const [showCandidates, setShowCandidates] =
    useState(true);
  const [humanProfile, setHumanProfile] =
    useState<string>('');

  const frame = useMemo(
    () =>
      buildReviewFrames(record).find(
        (item) =>
          item.moveNumber === moveNumber,
      ) ?? null,
    [record, moveNumber],
  );

  const run = async () => {
    setState('loading');
    setError(null);

    try {
      const result =
        await analyzeSavedGameMove(
          record,
          moveNumber,
          defaultKataGoProvider,
          {
            humanProfile:
              humanProfile || null,
            includeOwnership: true,
            includePolicy: true,
          },
        );

      setAnalysis(result);
      setState('ready');
    } catch (caught) {
      setAnalysis(null);
      setState('error');
      setError(
        caught instanceof Error
          ? caught.message
          : 'KataGo analysis failed.',
      );
    }
  };

  if (!frame) {
    return null;
  }

  const insight = analysis
    ? translateKataGoMoveReview(
        analysis,
        deterministicFinding,
      )
    : null;

  const candidateMarkers: BoardMarker[] =
    analysis && showCandidates
      ? analysis.position.candidates
          .filter(
            (candidate) =>
              candidate.point !== null,
          )
          .slice(0, 3)
          .map((candidate, index) => ({
            point: candidate.point!,
            label: String(index + 1),
            tone: 'accent' as const,
          }))
      : [];

  if (
    analysis?.actualPoint &&
    !candidateMarkers.some(
      (marker) =>
        marker.point.x ===
          analysis.actualPoint?.x &&
        marker.point.y ===
          analysis.actualPoint?.y,
    )
  ) {
    candidateMarkers.push({
      point: analysis.actualPoint,
      label: '!',
      tone: 'warning',
    });
  }

  const topCandidates =
    analysis?.position.candidates.slice(
      0,
      4,
    ) ?? [];

  return (
    <section
      className="engine-analysis"
      aria-labelledby={`engine-analysis-${moveNumber}`}
    >
      <div className="engine-analysis__heading">
        <div>
          <p className="eyebrow">
            KataGo · move {moveNumber}
          </p>
          <h2 id={`engine-analysis-${moveNumber}`}>
            Engine check
          </h2>
        </div>

        <select
          value={humanProfile}
          onChange={(event) => {
            setHumanProfile(
              event.target.value,
            );
            setAnalysis(null);
            setState('idle');
          }}
          aria-label="Human policy profile"
        >
          <option value="">
            Human model off
          </option>
          <option value="rank_20k">
            Human 20k
          </option>
          <option value="rank_15k">
            Human 15k
          </option>
          <option value="rank_10k">
            Human 10k
          </option>
          <option value="rank_5k">
            Human 5k
          </option>
        </select>
      </div>

      {state === 'idle' && (
        <div className="engine-analysis__idle">
          <p>
            Ask KataGo to compare this move with stronger alternatives.
            Analysis is optional and uses the configured external engine service.
          </p>
          <button
            className="secondary-action"
            type="button"
            onClick={run}
          >
            Analyze with KataGo
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div
          className="engine-analysis__status"
          role="status"
        >
          <span className="engine-analysis__spinner" />
          Analyzing this position…
        </div>
      )}

      {state === 'error' && (
        <div
          className="engine-analysis__error"
          role="alert"
        >
          <strong>
            Engine analysis unavailable
          </strong>
          <p>
            {error}
          </p>
          <small>
            Deterministic review remains fully usable without KataGo.
            Configure the analysis bridge to enable engine review.
          </small>
          <button
            className="control-chip"
            type="button"
            onClick={run}
          >
            Retry
          </button>
        </div>
      )}

      {analysis && insight && (
        <div className="engine-analysis__result">
          <div className="engine-insight">
            <div className="engine-insight__meta">
              <span>{insight.label}</span>
              {insight.scoreLossText && (
                <strong>
                  {insight.scoreLossText}
                </strong>
              )}
            </div>

            <h3>{insight.title}</h3>
            <p>{insight.summary}</p>
            <small>{insight.detail}</small>

            {insight.humanNote && (
              <p className="engine-human-note">
                {insight.humanNote}
              </p>
            )}
          </div>

          <div className="engine-analysis__controls">
            <button
              type="button"
              className={
                showCandidates
                  ? 'is-active'
                  : ''
              }
              onClick={() =>
                setShowCandidates(
                  (value) => !value,
                )
              }
            >
              Candidates
            </button>
            <button
              type="button"
              className={
                showOwnership
                  ? 'is-active'
                  : ''
              }
              disabled={
                !analysis.position
                  .ownership
              }
              onClick={() =>
                setShowOwnership(
                  (value) => !value,
                )
              }
            >
              Ownership
            </button>
          </div>

          <div className="engine-analysis__board">
            <GoBoard
              board={frame.before.board}
              label={`KataGo analysis before move ${moveNumber}`}
              markers={candidateMarkers}
              ownership={
                showOwnership &&
                analysis.position.ownership
                  ? {
                      values:
                        analysis.position
                          .ownership,
                      perspective:
                        analysis.position
                          .currentPlayer,
                      threshold: 0.2,
                    }
                  : null
              }
              showCoordinates={
                frame.before.board.size >=
                13
              }
            />
          </div>

          <div className="engine-analysis__metrics">
            <div>
              <span>Estimated loss</span>
              <strong>
                {analysis.scoreLoss ===
                null
                  ? '—'
                  : `${points(
                      analysis.scoreLoss,
                    )} pt`}
              </strong>
            </div>
            <div>
              <span>Winrate difference</span>
              <strong>
                {analysis.winrateLoss ===
                null
                  ? '—'
                  : percent(
                      analysis.winrateLoss,
                    )}
              </strong>
            </div>
            <div>
              <span>Search visits</span>
              <strong>
                {analysis.position
                  .rootVisits || '—'}
              </strong>
            </div>
          </div>

          <div className="engine-candidates">
            <div className="engine-candidates__heading">
              <span className="play-setting-label">
                Candidate moves
              </span>
              <small>
                Score is from the player-to-move perspective.
              </small>
            </div>

            {topCandidates.map(
              (candidate, index) => (
                <article
                  key={candidate.coordinate}
                  className="engine-candidate"
                >
                  <span className="engine-candidate__rank">
                    {index + 1}
                  </span>
                  <div>
                    <strong>
                      {candidate.coordinate}
                    </strong>
                    <small>
                      {candidate.pvCoordinates
                        .slice(0, 6)
                        .join(' → ')}
                    </small>
                  </div>
                  <div className="engine-candidate__numbers">
                    <span>
                      {candidate.scoreLead ===
                      null
                        ? '—'
                        : `${points(
                            candidate.scoreLead,
                          )} pt`}
                    </span>
                    <small>
                      {candidate.visits} visits
                      {candidate.humanPrior !==
                      null
                        ? ` · human ${percent(
                            candidate.humanPrior,
                          )}`
                        : ''}
                    </small>
                  </div>
                </article>
              ),
            )}
          </div>

          <button
            className="control-chip engine-analysis__rerun"
            type="button"
            onClick={run}
          >
            Re-analyze
          </button>
        </div>
      )}
    </section>
  );
}
