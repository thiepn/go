import {
  getGroup,
  pointKey,
  type Point,
  type Stone,
} from '../go/engine';
import {
  getConcept,
} from '../mastery/graph';
import type {
  SavedGameRecord,
} from '../play/types';
import {
  buildReviewFrames,
} from './replay';
import {
  atariGroupsFor,
  captureOpportunities,
  friendlyGroupsAdjacentTo,
  groupCapturedByMove,
  rescueMovesForGroup,
  samePoint,
} from './signals';
import type {
  GameReview,
  ReviewConceptSummary,
  ReviewFinding,
  ReviewSeverity,
} from './types';

function opponent(
  color: Stone,
): Stone {
  return color === 'black'
    ? 'white'
    : 'black';
}

function uniquePoints(
  points: readonly Point[],
): Point[] {
  const seen = new Set<string>();
  const result: Point[] = [];

  for (const point of points) {
    const key = pointKey(point);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(point);
  }

  return result;
}

function practiceTags(
  conceptId: string,
): readonly string[] {
  return getConcept(conceptId)?.practiceTags ?? [];
}

function finding(
  recordId: string,
  input: Omit<
    ReviewFinding,
    'id' | 'practiceTags'
  >,
): ReviewFinding {
  return {
    ...input,
    id:
      `${recordId}:m${input.moveNumber}:${input.kind}`,
    practiceTags: practiceTags(
      input.conceptId,
    ),
  };
}

function actualPoint(
  move: ReturnType<typeof buildReviewFrames>[number]['move'],
): Point | null {
  return move.type === 'play'
    ? move.point
    : null;
}

function severityRank(
  severity: ReviewSeverity,
): number {
  if (severity === 'mistake') return 3;
  if (severity === 'warning') return 2;
  return 1;
}

function summarizeConcepts(
  findings: readonly ReviewFinding[],
): ReviewConceptSummary[] {
  const map = new Map<
    string,
    ReviewConceptSummary
  >();

  for (const item of findings) {
    const current =
      map.get(item.conceptId) ?? {
        conceptId: item.conceptId,
        count: 0,
        mistakeCount: 0,
        warningCount: 0,
        opportunityCount: 0,
      };

    map.set(item.conceptId, {
      ...current,
      count: current.count + 1,
      mistakeCount:
        current.mistakeCount +
        (item.severity === 'mistake' ? 1 : 0),
      warningCount:
        current.warningCount +
        (item.severity === 'warning' ? 1 : 0),
      opportunityCount:
        current.opportunityCount +
        (item.severity === 'opportunity' ? 1 : 0),
    });
  }

  return [...map.values()].sort(
    (a, b) =>
      b.mistakeCount - a.mistakeCount ||
      b.warningCount - a.warningCount ||
      b.count - a.count,
  );
}

export function reviewSavedGame(
  record: SavedGameRecord,
): GameReview {
  const frames = buildReviewFrames(record);
  const findings: ReviewFinding[] = [];

  for (const [index, frame] of frames.entries()) {
    const player = frame.move.player;

    if (
      record.settings.mode === 'computer' &&
      player !== record.settings.humanColor
    ) {
      continue;
    }
    const next = frames[index + 1];
    const movePoint = actualPoint(
      frame.move,
    );
    const ownAtari = atariGroupsFor(
      frame.before,
      player,
    );
    const captures = captureOpportunities(
      frame.before,
    );
    let hasPunishedAtari = false;

    if (ownAtari.length > 0) {
      const unresolved = ownAtari.filter(
        (atari) => {
          const survivor = atari.stones.find(
            (stone) =>
              frame.after.board.intersections[
                stone.y * frame.after.board.size +
                stone.x
              ] === player,
          );

          if (!survivor) return true;

          const group = getGroup(
            frame.after.board,
            survivor,
          );

          return (
            !group ||
            group.liberties.length <= 1
          );
        },
      );

      const punished = unresolved.filter(
        (atari) =>
          next?.move.type === 'play' &&
          next.move.player === opponent(player) &&
          groupCapturedByMove(
            atari.stones,
            next.move.captured,
          ),
      );

      if (punished.length > 0) {
        hasPunishedAtari = true;
        const alternatives = uniquePoints(
          punished.flatMap((atari) =>
            rescueMovesForGroup(
              frame.before,
              atari.stones,
            ),
          ),
        );
        const stones = uniquePoints(
          punished.flatMap(
            (atari) => atari.stones,
          ),
        );

        findings.push(
          finding(record.id, {
            kind: 'ignored-atari',
            moveNumber: frame.moveNumber,
            player,
            severity: 'mistake',
            confidence: 'high',
            conceptId: 'safety',
            title: 'You left a group in atari, and it was captured',
            summary:
              'A threatened group had one liberty before this move. The opponent captured it immediately.',
            explanation:
              'When one of your groups has only one liberty, first check whether it can escape, connect, or capture the attacking stones. Because the next move actually removed this group, this is a high-confidence tactical mistake rather than a strategic opinion.',
            actualMove: movePoint,
            highlightPoints: stones,
            alternativePoints: alternatives,
            masteryEligible: true,
          }),
        );
      } else if (
        unresolved.length > 0 &&
        frame.move.type === 'pass'
      ) {
        findings.push(
          finding(record.id, {
            kind: 'pass-in-atari',
            moveNumber: frame.moveNumber,
            player,
            severity: 'warning',
            confidence: 'medium',
            conceptId: 'safety',
            title: 'You passed with a group in immediate danger',
            summary:
              'At least one of your groups still had only one liberty when you passed.',
            explanation:
              'This can be intentional when a group is already being sacrificed or is irrelevant to the final result, so it is a warning rather than an automatic blunder. For beginner review, it is still worth checking the group before ending play.',
            actualMove: null,
            highlightPoints: uniquePoints(
              unresolved.flatMap(
                (atari) => atari.stones,
              ),
            ),
            alternativePoints: uniquePoints(
              unresolved.flatMap((atari) =>
                rescueMovesForGroup(
                  frame.before,
                  atari.stones,
                ),
              ),
            ),
            masteryEligible: false,
          }),
        );
      } else if (unresolved.length > 0) {
        findings.push(
          finding(record.id, {
            kind: 'left-in-atari',
            moveNumber: frame.moveNumber,
            player,
            severity: 'warning',
            confidence: 'medium',
            conceptId: 'safety',
            title: 'A group was left in atari',
            summary:
              'You played elsewhere while one of your groups still had only one liberty.',
            explanation:
              'Sometimes sacrificing a group is correct. This review only flags the immediate tactical fact: the group was still capturable after your move. Check whether the sacrifice was intentional.',
            actualMove: movePoint,
            highlightPoints: uniquePoints(
              unresolved.flatMap(
                (atari) => atari.stones,
              ),
            ),
            alternativePoints: uniquePoints(
              unresolved.flatMap((atari) =>
                rescueMovesForGroup(
                  frame.before,
                  atari.stones,
                ),
              ),
            ),
            masteryEligible: false,
          }),
        );
      }
    }

    if (
      captures.length > 0 &&
      (
        frame.move.type === 'pass' ||
        frame.move.captured.length === 0
      ) &&
      !hasPunishedAtari
    ) {
      findings.push(
        finding(record.id, {
          kind: 'missed-capture',
          moveNumber: frame.moveNumber,
          player,
          severity: 'opportunity',
          confidence: 'medium',
          conceptId: 'capture',
          title: 'An immediate capture was available',
          summary:
            `Before this move, ${captures[0].captured} ${captures[0].captured === 1 ? 'stone could' : 'stones could'} be captured immediately.`,
          explanation:
            'Taking every available capture is not always strategically best, so this is shown as an opportunity rather than a blunder. For a developing player, immediate captures are still worth noticing before choosing another move.',
          actualMove: movePoint,
          highlightPoints: [],
          alternativePoints: captures.map(
            (capture) => capture.point,
          ),
          masteryEligible: false,
        }),
      );
    }

    if (
      frame.move.type === 'play' &&
      frame.move.captured.length === 0
    ) {
      const group = getGroup(
        frame.after.board,
        frame.move.point,
      );

      if (
        group &&
        group.liberties.length === 1
      ) {
        const punished =
          next?.move.type === 'play' &&
          next.move.player === opponent(player) &&
          groupCapturedByMove(
            group.stones,
            next.move.captured,
          );

        findings.push(
          finding(record.id, {
            kind: 'self-atari',
            moveNumber: frame.moveNumber,
            player,
            severity: punished
              ? 'mistake'
              : 'warning',
            confidence: punished
              ? 'high'
              : 'medium',
            conceptId: 'safety',
            title: punished
              ? 'This move put your group in atari and it was captured'
              : 'This move left your new group with one liberty',
            summary: punished
              ? 'The group created by this move had only one liberty, and the opponent captured it immediately.'
              : 'After your move, the connected group containing the new stone had only one liberty.',
            explanation: punished
              ? 'Because the opponent immediately captured the self-atari group, this is a high-confidence tactical mistake. Before playing into a tight space, count the liberties your resulting group will have.'
              : 'Self-atari can occasionally be intentional, especially as a sacrifice or tactical tesuji. This detector therefore treats an unpunished self-atari as a warning, not an automatic mistake.',
            actualMove: frame.move.point,
            highlightPoints: [...group.stones],
            alternativePoints: [],
            masteryEligible: Boolean(punished),
          }),
        );
      }
    }

    if (
      next?.move.type === 'play' &&
      next.move.player === opponent(player) &&
      friendlyGroupsAdjacentTo(
        frame.after.board,
        next.move.point,
        player,
      ) >= 2 &&
      friendlyGroupsAdjacentTo(
        frame.before.board,
        next.move.point,
        player,
      ) >= 2
    ) {
      findings.push(
        finding(record.id, {
          kind: 'direct-cut',
          moveNumber: frame.moveNumber,
          player,
          severity: 'warning',
          confidence: 'medium',
          conceptId: 'connection',
          title: 'The opponent took a direct connection point',
          summary:
            'On the next move, the opponent played between two separate groups that could have connected through that point.',
          explanation:
            'Allowing a cut can be intentional, so deterministic review cannot call this a strategic blunder. It does identify a concrete connection point that the opponent occupied immediately. Check whether keeping the groups connected was more important.',
          actualMove: movePoint,
          highlightPoints: [next.move.point],
          alternativePoints: [next.move.point],
          masteryEligible: false,
        }),
      );
    }
  }

  const deduped = [...new Map(
    findings.map((item) => [
      item.id,
      item,
    ]),
  ).values()].sort(
    (a, b) =>
      a.moveNumber - b.moveNumber ||
      severityRank(b.severity) -
        severityRank(a.severity),
  );

  return {
    record,
    frames,
    findings: deduped,
    concepts: summarizeConcepts(deduped),
    mistakeCount: deduped.filter(
      (item) => item.severity === 'mistake',
    ).length,
    warningCount: deduped.filter(
      (item) => item.severity === 'warning',
    ).length,
    opportunityCount: deduped.filter(
      (item) =>
        item.severity === 'opportunity',
    ).length,
  };
}
