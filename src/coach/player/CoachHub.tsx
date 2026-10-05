import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  analyzeSavedGameBatch,
  defaultKataGoProvider,
  fetchKataGoHealth,
  type KataGoHealth,
} from '../../analysis';
import {
  buildMasterySnapshot,
} from '../../mastery/model';
import {
  loadMasteryEvidence,
  migratePracticeHistory,
  saveMasteryEvidence,
} from '../../mastery/store';
import {
  loadProblemHistory,
} from '../../practice/history';
import type {
  ProblemDefinition,
} from '../../practice/types';
import {
  loadGameRecords,
} from '../../play/records';
import type {
  SavedGameRecord,
} from '../../play/types';
import {
  evaluateCoachPlan,
} from '../outcome';
import {
  buildCoachPlan,
  rebuildCoachPlanWithEngine,
} from '../plan';
import {
  activeCoachPlan,
  archiveCoachPlan,
  setActiveCoachPlan,
  updateCoachPlan,
} from '../store';
import type {
  CoachConfidence,
  CoachPlan,
} from '../types';
import './coach.css';

export interface CoachHubProps {
  readonly problems: readonly ProblemDefinition[];
  readonly onExit?: () => void;
  readonly onPractice?: (
    tags: readonly string[],
    planId: string,
  ) => void;
  readonly onPlay?: (
    objective: string,
    planId: string,
  ) => void;
  readonly onReview?: (
    record: SavedGameRecord,
  ) => void;
}

function percent(
  value: number,
): string {
  return `${Math.round(value * 100)}%`;
}

function signal(
  value: number | null,
): string {
  if (value === null) return '—';

  return (
    Math.round(value * 10) / 10
  ).toFixed(1);
}

function confidenceLabel(
  confidence: CoachConfidence,
): string {
  if (confidence === 'high') {
    return 'Strong evidence';
  }
  if (confidence === 'medium') {
    return 'Moderate evidence';
  }
  return 'Early signal';
}

function sourceLabel(
  source: string,
): string {
  if (source === 'combined') {
    return 'Review + KataGo';
  }
  if (source === 'engine') {
    return 'KataGo';
  }
  return 'Review';
}

export function CoachHub({
  problems,
  onExit,
  onPractice,
  onPlay,
  onReview,
}: CoachHubProps) {
  const [gamesVersion, setGamesVersion] =
    useState(0);
  const games = useMemo(
    () =>
      loadGameRecords().sort(
        (a, b) =>
          b.playedAt -
          a.playedAt,
      ),
    [gamesVersion],
  );

  const mastery = useMemo(() => {
    const existing =
      loadMasteryEvidence();
    const migrated =
      migratePracticeHistory(
        existing,
        loadProblemHistory(),
        problems,
      );

    if (
      migrated.length !==
      existing.length
    ) {
      saveMasteryEvidence(
        migrated,
      );
    }

    return buildMasterySnapshot(
      migrated,
    );
  }, [problems, gamesVersion]);

  const [plan, setPlan] =
    useState<CoachPlan | null>(
      () => activeCoachPlan(),
    );
  const [health, setHealth] =
    useState<KataGoHealth | null>(
      null,
    );
  const [engineState, setEngineState] =
    useState<
      'idle' | 'loading' | 'error'
    >('idle');
  const [engineError, setEngineError] =
    useState<string | null>(null);

  useEffect(() => {
    if (plan) return;

    const generated =
      buildCoachPlan({
        games,
        mastery,
      });

    if (generated) {
      setActiveCoachPlan(
        generated,
      );
      setPlan(generated);
    }
  }, [games, mastery, plan]);

  useEffect(() => {
    let mounted = true;

    fetchKataGoHealth().then(
      (next) => {
        if (mounted) {
          setHealth(next);
        }
      },
    );

    return () => {
      mounted = false;
    };
  }, []);

  const outcome = useMemo(
    () =>
      plan
        ? evaluateCoachPlan(
            plan,
            games,
            mastery,
          )
        : null,
    [plan, games, mastery],
  );

  const sourceGames = useMemo(
    () =>
      plan
        ? plan.sourceGameIds
            .map((id) =>
              games.find(
                (game) =>
                  game.id === id,
              ),
            )
            .filter(
              (
                game,
              ): game is SavedGameRecord =>
                Boolean(game),
            )
        : [],
    [plan, games],
  );

  const enhanceWithEngine =
    async () => {
      if (
        !plan ||
        sourceGames.length === 0
      ) {
        return;
      }

      setEngineState('loading');
      setEngineError(null);

      try {
        const scans =
          await Promise.all(
            sourceGames
              .slice(0, 3)
              .map((game) =>
                analyzeSavedGameBatch(
                  game,
                  defaultKataGoProvider,
                  {
                    includeOwnership:
                      false,
                    includePolicy:
                      false,
                    maxVisits:
                      game.settings
                        .boardSize <= 9
                        ? 180
                        : game.settings
                            .boardSize <=
                            13
                          ? 250
                          : 350,
                  },
                ),
              ),
          );

        const enhanced =
          rebuildCoachPlanWithEngine(
            plan,
            sourceGames,
            mastery,
            scans,
          );

        updateCoachPlan(
          enhanced,
        );
        setPlan(enhanced);
        setEngineState('idle');
      } catch (error) {
        setEngineState('error');
        setEngineError(
          error instanceof Error
            ? error.message
            : 'KataGo analysis failed.',
        );
      }
    };

  const makeNextPlan = () => {
    if (plan) {
      archiveCoachPlan(plan.id);
    }

    const next =
      buildCoachPlan({
        games,
        mastery,
        now: Date.now(),
      });

    if (next) {
      setActiveCoachPlan(next);
    }

    setPlan(next);
    setGamesVersion(
      (value) => value + 1,
    );
  };

  if (!plan) {
    return (
      <main className="coach-shell">
        <section className="coach-empty">
          <button
            className="lesson-icon-button"
            type="button"
            onClick={onExit}
            aria-label="Leave coach"
            disabled={!onExit}
          >
            ×
          </button>

          <p className="eyebrow">
            Personal coach
          </p>
          <h1>
            The coach needs evidence before it gives advice.
          </h1>
          <p>
            Complete practice or play an independent game first. The coach
            will not invent a weakness just to fill the screen.
          </p>

          <div className="coach-empty__actions">
            {onPractice && (
              <button
                className="primary-action"
                type="button"
                onClick={() =>
                  onPractice([], '')
                }
              >
                Start practice
              </button>
            )}
            {onPlay && (
              <button
                className="secondary-action"
                type="button"
                onClick={() =>
                  onPlay(
                    'Play normally. The coach is gathering a clean baseline.',
                    '',
                  )
                }
              >
                Play a game
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="coach-shell">
      <header className="coach-header">
        <button
          className="lesson-icon-button"
          type="button"
          onClick={onExit}
          aria-label="Leave coach"
          disabled={!onExit}
        >
          ×
        </button>

        <div>
          <p className="eyebrow">
            Personal coach
          </p>
          <h1>
            One weakness. One plan. Then test it in a real game.
          </h1>
          <p>
            The coach combines your mastery model with recent review evidence.
            KataGo can rank turning points, but it cannot invent a concept diagnosis.
          </p>
        </div>
      </header>

      <section
        className="coach-focus"
        aria-labelledby="coach-focus-title"
      >
        <div className="coach-focus__copy">
          <div className="coach-focus__meta">
            <span>
              {confidenceLabel(
                plan.focus.confidence,
              )}
            </span>
            {plan.focus.dueForReview && (
              <strong>
                Review due
              </strong>
            )}
          </div>

          <p className="eyebrow">
            Your next focus
          </p>
          <h2 id="coach-focus-title">
            {plan.focus.title}
          </h2>
          <p>{plan.focus.reason}</p>

          <div className="coach-focus__evidence">
            <span>
              {plan.focus.findingCount}{' '}
              recent finding
              {plan.focus.findingCount ===
              1
                ? ''
                : 's'}
            </span>
            <span>
              {plan.focus
                .recurringGameCount}{' '}
              affected game
              {plan.focus
                .recurringGameCount ===
              1
                ? ''
                : 's'}
            </span>
          </div>
        </div>

        <div className="coach-focus__mastery">
          <span>Current mastery</span>
          <strong>
            {percent(
              plan.focus
                .currentMastery,
            )}
          </strong>
          <div aria-hidden="true">
            <span
              style={{
                width:
                  `${Math.round(
                    plan.focus
                      .currentMastery *
                      100,
                  )}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="coach-cycle">
        <div className="coach-section-heading">
          <div>
            <p className="eyebrow">
              This cycle
            </p>
            <h2>
              Train it, carry it into a game, measure it.
            </h2>
          </div>
        </div>

        <div className="coach-cycle__steps">
          <article
            className={
              plan.practiceSummary
                ? 'is-complete'
                : ''
            }
          >
            <span>1</span>
            <div>
              <strong>
                Focused practice
              </strong>
              <p>
                {plan.focus
                  .practiceTags.length >
                0
                  ? 'A short five-problem set targets the concept and its immediate tactical habits.'
                  : 'Use the current course/review material for this concept; no dedicated problem tag exists yet.'}
              </p>
              {plan.practiceSummary && (
                <small>
                  Completed ·{' '}
                  {
                    plan
                      .practiceSummary
                      .cleanSolves
                  }
                  /
                  {
                    plan
                      .practiceSummary
                      .totalProblems
                  }{' '}
                  clean
                </small>
              )}
            </div>

            {onPractice &&
              plan.focus
                .practiceTags.length >
                0 && (
                <button
                  className="primary-action"
                  type="button"
                  onClick={() =>
                    onPractice(
                      plan.focus
                        .practiceTags,
                      plan.id,
                    )
                  }
                >
                  {plan.practiceSummary
                    ? 'Practice again'
                    : 'Practice this'}
                </button>
              )}
          </article>

          <article>
            <span>2</span>
            <div>
              <strong>
                One game objective
              </strong>
              <p>
                {plan.objective}
              </p>
              <small>
                Keep the rest of the game normal. One deliberate cue is easier
                to transfer than five simultaneous goals.
              </small>
            </div>

            {onPlay && (
              <button
                className="secondary-action"
                type="button"
                onClick={() =>
                  onPlay(
                    plan.objective,
                    plan.id,
                  )
                }
              >
                Play coached game
              </button>
            )}
          </article>

          <article
            className={
              outcome?.status ===
              'improved'
                ? 'is-complete'
                : ''
            }
          >
            <span>3</span>
            <div>
              <strong>
                Compare behavior
              </strong>
              <p>
                {outcome?.message}
              </p>
            </div>
          </article>
        </div>
      </section>

      {outcome && (
        <section
          className={[
            'coach-outcome',
            `coach-outcome--${outcome.status}`,
          ].join(' ')}
        >
          <div>
            <p className="eyebrow">
              Follow-up check
            </p>
            <h2>
              {outcome.status ===
              'awaiting-game'
                ? 'Ready to test'
                : outcome.status ===
                    'improved'
                  ? 'The pattern improved'
                  : outcome.status ===
                      'worse'
                    ? 'The pattern needs another cycle'
                    : outcome.status ===
                        'not-enough-play'
                      ? 'Need a fuller game'
                      : 'No clear change yet'}
            </h2>
            <p>{outcome.message}</p>
          </div>

          <div className="coach-outcome__metrics">
            <div>
              <span>
                Before
              </span>
              <strong>
                {signal(
                  outcome
                    .baselineSignalPer20Moves,
                )}
              </strong>
              <small>
                weighted findings /
                20 moves
              </small>
            </div>
            <div>
              <span>
                Follow-up
              </span>
              <strong>
                {signal(
                  outcome
                    .followupSignalPer20Moves,
                )}
              </strong>
              <small>
                weighted findings /
                20 moves
              </small>
            </div>
            <div>
              <span>
                Mastery
              </span>
              <strong>
                {outcome.masteryDelta >=
                0
                  ? '+'
                  : ''}
                {Math.round(
                  outcome.masteryDelta *
                    100,
                )}
                %
              </strong>
              <small>
                since plan baseline
              </small>
            </div>
          </div>

          {outcome.followupGame &&
            onReview && (
            <button
              className="secondary-action"
              type="button"
              onClick={() =>
                onReview(
                  outcome.followupGame!,
                )
              }
            >
              Review follow-up game
            </button>
          )}

          {outcome.status !==
            'awaiting-game' && (
            <button
              className="control-chip"
              type="button"
              onClick={makeNextPlan}
            >
              Build next plan
            </button>
          )}
        </section>
      )}

      <section className="coach-turning-points">
        <div className="coach-section-heading">
          <div>
            <p className="eyebrow">
              Important moments
            </p>
            <h2>
              Study the few positions that matter most.
            </h2>
          </div>

          <div className="coach-engine-action">
            <span
              className={
                health?.ready
                  ? 'is-ready'
                  : ''
              }
            >
              {plan.engineEnhanced
                ? 'KataGo ranking added'
                : health?.ready
                  ? 'KataGo available'
                  : 'Deterministic ranking'}
            </span>

            {!plan.engineEnhanced &&
              health?.ready && (
              <button
                className="control-chip"
                type="button"
                disabled={
                  engineState ===
                  'loading'
                }
                onClick={
                  enhanceWithEngine
                }
              >
                {engineState ===
                'loading'
                  ? 'Analyzing…'
                  : 'Add KataGo ranking'}
              </button>
            )}
          </div>
        </div>

        {engineState === 'error' &&
          engineError && (
          <p
            className="coach-engine-error"
            role="alert"
          >
            {engineError} The current deterministic plan remains valid.
          </p>
        )}

        {plan.turningPoints.length >
        0 ? (
          <div className="coach-turning-point-list">
            {plan.turningPoints.map(
              (point, index) => {
                const game =
                  games.find(
                    (item) =>
                      item.id ===
                      point.gameId,
                  );

                return (
                  <article
                    key={point.id}
                  >
                    <span className="coach-turning-point__rank">
                      {index + 1}
                    </span>
                    <div>
                      <div className="coach-turning-point__meta">
                        <span>
                          Move{' '}
                          {
                            point.moveNumber
                          }
                        </span>
                        <span>
                          {sourceLabel(
                            point.source,
                          )}
                        </span>
                        {point.scoreLoss !==
                          null && (
                          <strong>
                            ≈{' '}
                            {Math.round(
                              point.scoreLoss *
                                10,
                            ) / 10}{' '}
                            pt
                          </strong>
                        )}
                      </div>
                      <h3>
                        {point.title}
                      </h3>
                      <p>
                        {
                          point.explanation
                        }
                      </p>
                    </div>

                    {game &&
                      onReview && (
                      <button
                        className="secondary-action"
                        type="button"
                        onClick={() =>
                          onReview(game)
                        }
                      >
                        Open review
                      </button>
                    )}
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <div className="coach-turning-points__empty">
            <p>
              No recent game position is strong enough to call a turning point
              yet. The focus is currently coming from your broader mastery evidence.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
