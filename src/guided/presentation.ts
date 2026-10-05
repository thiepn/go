import type {
  BoardHighlight,
  BoardMarker,
  GhostStone,
} from '../board';
import type {
  GuidedGameState,
} from './runtime';
import type {
  GuidedGameScenario,
} from './types';

export interface GuidedPresentation {
  readonly highlights: readonly BoardHighlight[];
  readonly markers: readonly BoardMarker[];
  readonly ghostStone: GhostStone | null;
  readonly helpText: string | null;
  readonly helpTitle: string | null;
}

export function guidedPresentation(
  scenario: GuidedGameScenario,
  state: GuidedGameState,
): GuidedPresentation {
  const turn = scenario.turns[state.turnIndex];

  if (!turn || state.helpMode === 'none') {
    return {
      highlights: [],
      markers: [],
      ghostStone: null,
      helpText: null,
      helpTitle: null,
    };
  }

  if (state.helpMode === 'what-matters') {
    return {
      highlights: [],
      markers: [],
      ghostStone: null,
      helpTitle: 'What matters?',
      helpText: turn.help.whatMatters,
    };
  }

  if (state.helpMode === 'why') {
    return {
      highlights: [],
      markers: [],
      ghostStone: null,
      helpTitle: 'Why?',
      helpText: turn.help.why,
    };
  }

  if (state.helpMode === 'show-me') {
    return {
      highlights: (turn.help.showPoints ?? []).map((point) => ({
        point,
        kind: 'focus',
        pulse: true,
      })),
      markers: [],
      ghostStone:
        turn.type === 'play' &&
        turn.recommendedMoves &&
        turn.recommendedMoves.length === 1
          ? {
              point: turn.recommendedMoves[0],
              color: state.game.toPlay,
            }
          : null,
      helpTitle: 'Show me',
      helpText:
        turn.help.showPoints && turn.help.showPoints.length > 0
          ? 'The important area is highlighted on the board.'
          : turn.help.whatMatters,
    };
  }

  return {
    highlights: [],
    markers: (turn.help.sequence ?? []).map((point, index) => ({
      point,
      label: String(index + 1),
      tone: 'accent',
    })),
    ghostStone: null,
    helpTitle: 'Show the sequence',
    helpText:
      turn.help.sequence && turn.help.sequence.length > 0
        ? 'Read the numbered points in order.'
        : 'There is no forced sequence to show here. Focus on the idea instead.',
  };
}
