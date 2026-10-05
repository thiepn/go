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
  CoachOutcome,
  CoachPlan,
} from './types';

function learnerMoveCount(
  game: SavedGameRecord,
): number {
  if (
    game.settings.mode === 'local'
  ) {
    return game.moves.length;
  }

  return game.moves.filter(
    (move) =>
      move.player ===
      game.settings.humanColor,
  ).length;
}

function signalWeight(
  severity: string,
): number {
  if (severity === 'mistake') {
    return 2.5;
  }
  if (severity === 'warning') {
    return 1.1;
  }
  return 0.45;
}

export function conceptSignalPer20Moves(
  game: SavedGameRecord,
  conceptId: string,
): {
  readonly signal: number;
  readonly findings: number;
  readonly learnerMoves: number;
} {
  const review =
    reviewSavedGame(game);
  const learnerMoves =
    learnerMoveCount(game);
  const matching =
    review.findings.filter(
      (finding) =>
        finding.conceptId ===
        conceptId,
    );
  const weighted =
    matching.reduce(
      (sum, finding) =>
        sum +
        signalWeight(
          finding.severity,
        ),
      0,
    );

  return {
    signal:
      learnerMoves === 0
        ? 0
        : weighted /
          learnerMoves *
          20,
    findings:
      matching.length,
    learnerMoves,
  };
}

export function evaluateCoachPlan(
  plan: CoachPlan,
  games: readonly SavedGameRecord[],
  mastery: MasterySnapshot,
): CoachOutcome {
  const followups =
    [...games]
      .filter(
        (game) =>
          game.playedAt >
          plan.createdAt,
      )
      .sort(
        (a, b) =>
          a.playedAt -
          b.playedAt,
      );

  const followup =
    followups.find(
      (game) =>
        learnerMoveCount(game) >=
        10,
    ) ??
    followups[0] ??
    null;

  const currentMastery =
    mastery.concepts[
      plan.focus.conceptId
    ]?.mastery ??
    plan.baseline.mastery;
  const masteryDelta =
    currentMastery -
    plan.baseline.mastery;

  if (!followup) {
    return {
      status: 'awaiting-game',
      followupGame: null,
      baselineSignalPer20Moves:
        plan.baseline
          .signalPer20Moves,
      followupSignalPer20Moves:
        null,
      baselineMastery:
        plan.baseline.mastery,
      currentMastery,
      masteryDelta,
      matchingFindings: 0,
      message:
        'Your plan is ready. Practice the focus, then play one independent game so the coach can compare the same pattern.',
    };
  }

  const measured =
    conceptSignalPer20Moves(
      followup,
      plan.focus.conceptId,
    );

  if (measured.learnerMoves < 10) {
    return {
      status: 'not-enough-play',
      followupGame: followup,
      baselineSignalPer20Moves:
        plan.baseline
          .signalPer20Moves,
      followupSignalPer20Moves:
        measured.signal,
      baselineMastery:
        plan.baseline.mastery,
      currentMastery,
      masteryDelta,
      matchingFindings:
        measured.findings,
      message:
        'A follow-up game exists, but it was too short to be a useful behavior check. Play another normal game with the same focus.',
    };
  }

  const baseline =
    plan.baseline
      .signalPer20Moves;

  if (baseline === null) {
    const status =
      masteryDelta >= 0.08
        ? 'improved'
        : 'stable';

    return {
      status,
      followupGame: followup,
      baselineSignalPer20Moves:
        null,
      followupSignalPer20Moves:
        measured.signal,
      baselineMastery:
        plan.baseline.mastery,
      currentMastery,
      masteryDelta,
      matchingFindings:
        measured.findings,
      message:
        status === 'improved'
          ? 'Your mastery evidence improved after the intervention. Keep the same idea active for another game before moving on.'
          : 'There was not enough pre-plan game evidence for a clean before/after comparison yet. The follow-up game now gives the coach a better baseline.',
    };
  }

  const improvement =
    baseline - measured.signal;
  const improved =
    measured.signal <=
      baseline * 0.65 ||
    improvement >= 0.65;
  const worse =
    measured.signal >=
      baseline * 1.35 &&
    measured.signal - baseline >=
      0.45;

  if (improved) {
    return {
      status: 'improved',
      followupGame: followup,
      baselineSignalPer20Moves:
        baseline,
      followupSignalPer20Moves:
        measured.signal,
      baselineMastery:
        plan.baseline.mastery,
      currentMastery,
      masteryDelta,
      matchingFindings:
        measured.findings,
      message:
        measured.findings === 0
          ? 'The coached mistake pattern did not appear in the follow-up game. That is a strong positive signal; repeat it once more before treating the skill as stable.'
          : 'The coached pattern appeared substantially less often per move in the follow-up game. The intervention is transferring into play.',
    };
  }

  if (worse) {
    return {
      status: 'worse',
      followupGame: followup,
      baselineSignalPer20Moves:
        baseline,
      followupSignalPer20Moves:
        measured.signal,
      baselineMastery:
        plan.baseline.mastery,
      currentMastery,
      masteryDelta,
      matchingFindings:
        measured.findings,
      message:
        'The same pattern appeared more often in the follow-up game. Keep the focus narrow and return to the turning point plus targeted practice before another game.',
    };
  }

  return {
    status: 'stable',
    followupGame: followup,
    baselineSignalPer20Moves:
      baseline,
    followupSignalPer20Moves:
      measured.signal,
    baselineMastery:
      plan.baseline.mastery,
    currentMastery,
    masteryDelta,
    matchingFindings:
      measured.findings,
    message:
      'The follow-up game did not show a clear change yet. One game is noisy; keep the same focus for another game instead of switching topics immediately.',
  };
}
