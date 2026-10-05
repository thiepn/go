import {
  getGroup,
  type GameState,
  type Point,
  type Stone,
} from '../go/engine';
import { inspectPosition } from '../guided';

export interface CoachCue {
  readonly title: string;
  readonly text: string;
  readonly points: readonly Point[];
  readonly concept: string | null;
}

export function getCoachCue(
  game: GameState,
  learnerColor: Stone,
): CoachCue {
  const signals = inspectPosition(
    game,
    learnerColor,
  );

  if (signals.learnerAtariGroups.length > 0) {
    const group = signals.learnerAtariGroups[0];
    const detail = getGroup(game.board, group[0]);
    const liberty = detail?.liberties[0];

    return {
      title: 'Your group is in atari',
      text:
        'Before playing elsewhere, check whether this group should escape, connect, or capture something.',
      points: liberty ? [liberty] : [],
      concept: 'safety',
    };
  }

  if (signals.captureMoves.length > 0) {
    return {
      title: 'A capture is available',
      text:
        'One opposing group has run out of breathing room. Look for its final liberty.',
      points: signals.captureMoves,
      concept: 'capture',
    };
  }

  return {
    title: 'No urgent tactic',
    text:
      'Look for weak groups, useful connections, and ways to make or reduce territory. You do not need to fight every stone.',
    points: [],
    concept: null,
  };
}
