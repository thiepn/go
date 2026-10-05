import { useMemo } from 'react';

import { loadProblemHistory } from '../../practice/history';
import type { ProblemDefinition } from '../../practice/types';
import {
  CONCEPTS,
} from '../graph';
import {
  recommendMasteryFocus,
} from '../diagnosis';
import {
  buildMasterySnapshot,
} from '../model';
import {
  loadMasteryEvidence,
  migratePracticeHistory,
  saveMasteryEvidence,
} from '../store';
import type {
  ConceptMastery,
  MasteryState,
} from '../types';
import './mastery.css';

export interface MasteryDashboardProps {
  readonly problems: readonly ProblemDefinition[];
  readonly onExit?: () => void;
  readonly onPractice?: (tags: readonly string[]) => void;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function stateLabel(state: MasteryState): string {
  switch (state) {
    case 'unknown':
      return 'Not measured';
    case 'learning':
      return 'Learning';
    case 'established':
      return 'Established';
    case 'mastered':
      return 'Mastered';
  }
}

function conceptMetric(
  concept: ConceptMastery,
): string {
  if (concept.evidenceCount === 0) return '—';
  return percent(concept.mastery);
}

export function MasteryDashboard({
  problems,
  onExit,
  onPractice,
}: MasteryDashboardProps) {
  const evidence = useMemo(() => {
    const existing = loadMasteryEvidence();
    const migrated = migratePracticeHistory(
      existing,
      loadProblemHistory(),
      problems,
    );

    if (migrated.length !== existing.length) {
      saveMasteryEvidence(migrated);
    }

    return migrated;
  }, [problems]);

  const snapshot = useMemo(
    () => buildMasterySnapshot(evidence),
    [evidence],
  );

  const recommendation = useMemo(
    () => recommendMasteryFocus(snapshot),
    [snapshot],
  );

  const dueCount = Object.values(snapshot.concepts).filter(
    (concept) => concept.dueForReview,
  ).length;

  const measuredCount = Object.values(snapshot.concepts).filter(
    (concept) => concept.evidenceCount > 0,
  ).length;

  return (
    <main className="mastery-shell">
      <header className="mastery-header">
        <button
          className="lesson-icon-button"
          type="button"
          onClick={onExit}
          aria-label="Leave progress"
          disabled={!onExit}
        >
          ×
        </button>

        <div>
          <p className="eyebrow">Progress</p>
          <h1>What is actually sticking?</h1>
          <p>
            Mastery combines your lessons, practice, game behavior,
            hint use, and how recently each idea was tested.
          </p>
        </div>
      </header>

      <section className="mastery-overview" aria-label="Mastery overview">
        <div className="mastery-overall">
          <span>Measured mastery</span>
          <strong>
            {snapshot.evidenceCount === 0
              ? '—'
              : percent(snapshot.overallMastery)}
          </strong>
          <small>
            {measuredCount}/{CONCEPTS.length} concepts measured
            {dueCount > 0 ? ` · ${dueCount} due for review` : ''}
          </small>
        </div>

        <div className="mastery-overall__bar" aria-hidden="true">
          <span
            style={{
              width: `${Math.round(snapshot.overallMastery * 100)}%`,
            }}
          />
        </div>
      </section>

      {recommendation ? (
        <section
          className="mastery-recommendation"
          aria-labelledby="mastery-recommendation-title"
        >
          <div>
            <p className="eyebrow">
              {recommendation.dueForReview
                ? 'Review next'
                : 'Best next focus'}
            </p>
            <h2 id="mastery-recommendation-title">
              {recommendation.title}
            </h2>
            <p>{recommendation.reason}</p>
          </div>

          <div className="mastery-recommendation__score">
            <span>{percent(recommendation.mastery)}</span>
            <small>current mastery</small>
          </div>

          {onPractice && recommendation.practiceTags.length > 0 && (
            <button
              className="primary-action mastery-practice-action"
              type="button"
              onClick={() =>
                onPractice(recommendation.practiceTags)
              }
            >
              Practice this
            </button>
          )}
        </section>
      ) : (
        <section className="mastery-empty">
          <p className="eyebrow">Not enough evidence yet</p>
          <h2>Complete a few practice problems first.</h2>
          <p>
            The app will avoid inventing a weakness before it has enough
            behavioral evidence to support one.
          </p>
          {onPractice && (
            <button
              className="primary-action mastery-practice-action"
              type="button"
              onClick={() => onPractice([])}
            >
              Start practice
            </button>
          )}
        </section>
      )}

      <section className="mastery-map" aria-labelledby="mastery-map-title">
        <div className="mastery-section-heading">
          <div>
            <p className="eyebrow">Knowledge graph</p>
            <h2 id="mastery-map-title">Foundations before symptoms.</h2>
          </div>
          <p>
            A downstream skill is moderated by its prerequisites, so a weak
            foundation cannot be hidden by one lucky solve.
          </p>
        </div>

        <div className="mastery-grid">
          {CONCEPTS.map((definition) => {
            const concept = snapshot.concepts[definition.id];
            const prerequisites = definition.prerequisites
              .map((id) => snapshot.concepts[id]?.concept.title)
              .filter(Boolean);

            return (
              <article
                key={definition.id}
                className={[
                  'mastery-card',
                  `mastery-card--${concept.state}`,
                  concept.dueForReview
                    ? 'mastery-card--due'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="mastery-card__top">
                  <span
                    className={`mastery-stone mastery-stone--${concept.state}`}
                    aria-hidden="true"
                  />
                  <span className="mastery-card__value">
                    {conceptMetric(concept)}
                  </span>
                </div>

                <h3>{definition.title}</h3>
                <p>{definition.description}</p>

                <div className="mastery-card__state">
                  <span>{stateLabel(concept.state)}</span>
                  {concept.dueForReview && <strong>Review due</strong>}
                </div>

                {concept.evidenceCount > 0 && (
                  <dl className="mastery-card__metrics">
                    <div>
                      <dt>Accuracy</dt>
                      <dd>{percent(concept.accuracy)}</dd>
                    </div>
                    <div>
                      <dt>Retention</dt>
                      <dd>{percent(concept.retention)}</dd>
                    </div>
                    <div>
                      <dt>Evidence</dt>
                      <dd>{concept.evidenceCount}</dd>
                    </div>
                  </dl>
                )}

                {prerequisites.length > 0 && (
                  <small className="mastery-card__prerequisites">
                    Builds on {prerequisites.join(' · ')}
                  </small>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
