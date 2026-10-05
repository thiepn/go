import type {
  ReviewFinding,
} from '../review/types';
import type {
  KataGoMoveReview,
} from './types';

export interface EngineTeachingInsight {
  readonly label: string;
  readonly title: string;
  readonly summary: string;
  readonly detail: string;
  readonly scoreLossText: string | null;
  readonly humanNote: string | null;
}

function points(
  value: number,
): string {
  const rounded =
    Math.round(value * 10) / 10;

  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1);
}

function profileLabel(
  profile: string,
): string {
  const match =
    /^rank_(\d+)([kd])$/.exec(profile);

  if (!match) return profile;

  return `${match[1]}${match[2]}`;
}

export function translateKataGoMoveReview(
  review: KataGoMoveReview,
  deterministic?: ReviewFinding | null,
): EngineTeachingInsight {
  const loss = review.scoreLoss;
  const best = review.best?.coordinate;
  const actualHuman =
    review.actual?.humanPrior ?? null;
  const humanProfile =
    review.position.humanProfile;

  let label = 'Engine check';
  let title =
    'KataGo could not confidently compare this move.';
  let summary =
    'The analysis result did not include enough comparable score information for the move you played.';
  let detail =
    'You can still inspect the suggested candidate moves and principal variations without treating this position as graded.';

  if (loss !== null) {
    if (review.assessment === 'good') {
      label = 'Reasonable move';
      title = 'Your move was close to KataGo’s best choices.';
      summary =
        loss < 0.35
          ? 'KataGo sees essentially no meaningful point loss here.'
          : `KataGo estimates roughly ${points(loss)} points of difference from its preferred move.`;
      detail =
        'For a developing player, this is not a move that needs urgent correction. Focus on larger mistakes first.';
    } else if (
      review.assessment ===
      'small-loss'
    ) {
      label = 'Small improvement';
      title =
        'A slightly better move was available.';
      summary =
        `KataGo estimates about ${points(loss)} points were available by choosing a stronger candidate${best ? ` such as ${best}` : ''}.`;
      detail =
        'This is useful refinement, but usually less important than tactical mistakes or larger score swings.';
    } else if (
      review.assessment === 'mistake'
    ) {
      label = 'Meaningful mistake';
      title =
        'This move gave up several points.';
      summary =
        `KataGo estimates about ${points(loss)} points of loss compared with its preferred continuation${best ? ` beginning at ${best}` : ''}.`;
      detail =
        deterministic
          ? `The engine result supports the concrete ${deterministic.conceptId} issue already identified by deterministic review. Use the tactical explanation first, then use the engine line to see how the position develops.`
          : 'There was a meaningful difference here, but engine score alone does not explain the concept. Compare the candidate line and ownership change before drawing a lesson from it.';
    } else if (
      review.assessment ===
      'major-mistake'
    ) {
      label = 'Turning point';
      title =
        'This was one of the positions worth studying first.';
      summary =
        `KataGo estimates roughly ${points(loss)} points of loss compared with its preferred move${best ? ` at ${best}` : ''}.`;
      detail =
        deterministic
          ? `The large score swing and the deterministic ${deterministic.conceptId} finding point to the same moment. This is a strong candidate for targeted practice.`
          : 'A large engine swing tells us the move mattered, but not why. Use the candidate variation and Study workspace before assigning a conceptual weakness.';
    }
  }

  let humanNote: string | null = null;

  if (
    humanProfile &&
    actualHuman !== null
  ) {
    const profile =
      profileLabel(humanProfile);
    const pct = Math.round(
      actualHuman * 100,
    );

    if (actualHuman >= 0.08) {
      humanNote =
        `The Human SL model gives your move about ${pct}% policy at the ${profile} profile, so it is a recognizable human choice even if KataGo prefers something else.`;
    } else if (actualHuman <= 0.01) {
      humanNote =
        `The Human SL model gives this move only about ${pct}% policy at the ${profile} profile, so it is relatively uncommon for that modeled level.`;
    } else {
      humanNote =
        `The Human SL model gives this move about ${pct}% policy at the ${profile} profile.`;
    }
  }

  return {
    label,
    title,
    summary,
    detail,
    scoreLossText:
      loss === null
        ? null
        : `${points(loss)} pt`,
    humanNote,
  };
}
