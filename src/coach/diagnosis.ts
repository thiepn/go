import {
  descendantCount,
  getConcept,
} from '../mastery/graph';
import {
  recommendMasteryFocus,
} from '../mastery/diagnosis';
import type {
  MasterySnapshot,
} from '../mastery/types';
import type {
  SavedGameRecord,
} from '../play/types';
import {
  reviewSavedGame,
} from '../review/analyze';
import type {
  ReviewFinding,
} from '../review/types';
import type {
  CoachConfidence,
  CoachFocus,
} from './types';

interface ConceptSignal {
  readonly conceptId: string;
  readonly score: number;
  readonly findingCount: number;
  readonly gameIds: ReadonlySet<string>;
  readonly highConfidenceMistakes: number;
}

function findingWeight(
  finding: ReviewFinding,
): number {
  const severity =
    finding.severity === 'mistake'
      ? 3
      : finding.severity === 'warning'
        ? 1.35
        : 0.55;

  return (
    severity +
    (finding.confidence === 'high'
      ? 0.65
      : 0)
  );
}

function recentGameSignals(
  games: readonly SavedGameRecord[],
): Map<string, ConceptSignal> {
  const working = new Map<
    string,
    {
      score: number;
      findingCount: number;
      gameIds: Set<string>;
      highConfidenceMistakes: number;
    }
  >();

  games.slice(0, 5).forEach(
    (game, gameIndex) => {
      const recency =
        Math.max(
          0.45,
          1 - gameIndex * 0.13,
        );
      const review =
        reviewSavedGame(game);

      for (const finding of review.findings) {
        const current =
          working.get(
            finding.conceptId,
          ) ?? {
            score: 0,
            findingCount: 0,
            gameIds: new Set<string>(),
            highConfidenceMistakes: 0,
          };

        current.score +=
          findingWeight(finding) *
          recency;
        current.findingCount += 1;
        current.gameIds.add(game.id);
        current.highConfidenceMistakes +=
          finding.severity === 'mistake' &&
          finding.confidence === 'high'
            ? 1
            : 0;

        working.set(
          finding.conceptId,
          current,
        );
      }
    },
  );

  return new Map(
    [...working.entries()].map(
      ([conceptId, value]) => [
        conceptId,
        {
          conceptId,
          ...value,
        },
      ],
    ),
  );
}

function trainableRoot(
  conceptId: string,
  mastery: MasterySnapshot,
): string {
  let current = conceptId;
  const visited = new Set<string>();

  while (!visited.has(current)) {
    visited.add(current);
    const definition =
      getConcept(current);
    const currentMastery =
      mastery.concepts[current];

    if (!definition || !currentMastery) {
      return current;
    }

    const candidates =
      definition.prerequisites
        .map((id) => mastery.concepts[id])
        .filter(
          (
            concept,
          ): concept is NonNullable<
            typeof concept
          > =>
            Boolean(
              concept &&
              concept.evidenceCount > 0 &&
              concept.concept
                .practiceTags.length > 0,
            ),
        )
        .filter(
          (concept) =>
            concept.mastery + 0.08 <
              currentMastery.mastery ||
            concept.dueForReview,
        )
        .sort(
          (a, b) =>
            a.mastery - b.mastery ||
            b.concept.prerequisites
              .length -
              a.concept.prerequisites
                .length,
        );

    const weaker =
      candidates[0];

    if (!weaker) {
      return current;
    }

    current = weaker.concept.id;
  }

  return current;
}

function confidenceFor(
  signal: ConceptSignal | undefined,
  snapshotConfidence: number,
): CoachConfidence {
  if (
    signal &&
    signal.gameIds.size >= 2 &&
    (
      signal.highConfidenceMistakes >=
        2 ||
      signal.findingCount >= 4
    ) &&
    snapshotConfidence >= 0.35
  ) {
    return 'high';
  }

  if (
    signal &&
    (
      signal.findingCount >= 2 ||
      signal.highConfidenceMistakes >=
        1
    )
  ) {
    return 'medium';
  }

  if (snapshotConfidence >= 0.45) {
    return 'medium';
  }

  return 'low';
}

export function diagnoseCoachFocus(
  games: readonly SavedGameRecord[],
  mastery: MasterySnapshot,
): CoachFocus | null {
  const signals =
    recentGameSignals(games);

  const ranked = [...signals.values()]
    .map((signal) => {
      const concept =
        mastery.concepts[
          signal.conceptId
        ];
      const weakness =
        concept
          ? 1 - concept.mastery
          : 0.5;
      const recurrence =
        Math.max(
          0,
          signal.gameIds.size - 1,
        );
      const leverage =
        descendantCount(
          signal.conceptId,
        );

      return {
        signal,
        score:
          signal.score +
          weakness * 2.2 +
          recurrence * 0.65 +
          Math.min(
            0.5,
            leverage * 0.06,
          ) +
          (concept?.dueForReview
            ? 0.45
            : 0),
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score,
    );

  const gameCandidate =
    ranked[0]?.signal ?? null;
  const fallback =
    recommendMasteryFocus(mastery);

  if (!gameCandidate && !fallback) {
    return null;
  }

  const symptomId =
    gameCandidate?.conceptId ??
    fallback?.conceptId;

  if (!symptomId) return null;

  const rootId =
    trainableRoot(
      symptomId,
      mastery,
    );
  const root =
    mastery.concepts[rootId];
  const definition =
    getConcept(rootId);

  if (!root || !definition) {
    return null;
  }

  const rootSignal =
    signals.get(rootId);
  const symptom =
    getConcept(symptomId);

  const reason =
    rootId !== symptomId
      ? `${symptom?.title ?? symptomId} is showing up in recent games, but ${definition.title} is the weaker prerequisite underneath it. Training the foundation should transfer better than drilling only the symptom.`
      : gameCandidate
        ? `${definition.title} appeared in ${gameCandidate.findingCount} review finding${gameCandidate.findingCount === 1 ? '' : 's'} across ${gameCandidate.gameIds.size} recent game${gameCandidate.gameIds.size === 1 ? '' : 's'}. Its current mastery is ${Math.round(root.mastery * 100)}%, so it is the clearest high-leverage focus now.`
        : fallback?.reason ??
          `${definition.title} is the strongest current coaching candidate from your mastery evidence.`;

  return {
    conceptId: rootId,
    title: definition.title,
    confidence:
      confidenceFor(
        rootSignal ??
          gameCandidate ??
          undefined,
        root.confidence,
      ),
    reason,
    practiceTags:
      definition.practiceTags,
    currentMastery:
      root.mastery,
    dueForReview:
      root.dueForReview,
    recurringGameCount:
      (
        rootSignal ??
        gameCandidate
      )?.gameIds.size ?? 0,
    findingCount:
      (
        rootSignal ??
        gameCandidate
      )?.findingCount ?? 0,
  };
}
