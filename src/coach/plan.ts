import type {
  MasterySnapshot,
} from '../mastery/types';
import type {
  SavedGameRecord,
} from '../play/types';
import {
  conceptSignalPer20Moves,
} from './outcome';
import {
  diagnoseCoachFocus,
} from './diagnosis';
import {
  objectiveForConcept,
} from './objectives';
import {
  selectCoachTurningPoints,
} from './turningPoints';
import type {
  CoachBaseline,
  CoachPlan,
  CoachPlanInput,
} from './types';

function baselineFor(
  games: readonly SavedGameRecord[],
  conceptId: string,
  mastery: MasterySnapshot,
): CoachBaseline {
  const measured = games
    .slice(0, 4)
    .map((game) =>
      conceptSignalPer20Moves(
        game,
        conceptId,
      ),
    )
    .filter(
      (item) =>
        item.learnerMoves >= 10,
    );

  const findingCount =
    measured.reduce(
      (sum, item) =>
        sum + item.findings,
      0,
    );
  const learnerMoves =
    measured.reduce(
      (sum, item) =>
        sum + item.learnerMoves,
      0,
    );
  const weightedSignal =
    learnerMoves === 0
      ? null
      : measured.reduce(
          (sum, item) =>
            sum +
            item.signal *
              item.learnerMoves,
          0,
        ) /
        learnerMoves;

  return {
    mastery:
      mastery.concepts[conceptId]
        ?.mastery ?? 0,
    signalPer20Moves:
      weightedSignal,
    findingCount,
    learnerMoves,
  };
}

export function buildCoachPlan(
  input: CoachPlanInput,
): CoachPlan | null {
  const now =
    input.now ?? Date.now();
  const games = [...input.games]
    .sort(
      (a, b) =>
        b.playedAt -
        a.playedAt,
    )
    .slice(0, 8);
  const focus =
    diagnoseCoachFocus(
      games,
      input.mastery,
    );

  if (!focus) return null;

  return {
    id:
      `coach-${now}-${focus.conceptId}`,
    createdAt: now,
    sourceGameIds:
      games
        .slice(0, 5)
        .map((game) => game.id),
    focus,
    objective:
      objectiveForConcept(
        focus.conceptId,
      ),
    turningPoints:
      selectCoachTurningPoints(
        games,
        focus.conceptId,
        input.engineScans,
      ),
    baseline:
      baselineFor(
        games,
        focus.conceptId,
        input.mastery,
      ),
    engineEnhanced:
      (input.engineScans?.length ??
        0) > 0,
  };
}

export function rebuildCoachPlanWithEngine(
  plan: CoachPlan,
  games: readonly SavedGameRecord[],
  mastery: MasterySnapshot,
  engineScans: CoachPlanInput['engineScans'],
  now = Date.now(),
): CoachPlan {
  const rebuilt =
    buildCoachPlan({
      games,
      mastery,
      engineScans,
      now,
    });

  if (!rebuilt) {
    return {
      ...plan,
      engineEnhanced: true,
    };
  }

  return {
    ...rebuilt,
    id: plan.id,
    createdAt:
      plan.createdAt,
    practiceSummary:
      plan.practiceSummary,
    engineEnhanced: true,
  };
}
