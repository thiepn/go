import type { Stone } from '../go/engine';
import {
  handicapPoints,
} from '../play/handicap';
import type {
  SavedGameRecord,
} from '../play/types';
import {
  pointToKataGo,
} from './coordinates';
import type {
  KataGoAnalysisOptions,
  KataGoColor,
  KataGoQuery,
} from './types';

function color(
  stone: Stone,
): KataGoColor {
  return stone === 'black' ? 'B' : 'W';
}

function defaultVisits(
  boardSize: number,
): number {
  if (boardSize <= 9) return 250;
  if (boardSize <= 13) return 350;
  return 500;
}

function moveTuple(
  move: SavedGameRecord['moves'][number],
  boardSize: number,
): readonly [KataGoColor, string] {
  return [
    color(move.player),
    move.type === 'pass'
      ? 'pass'
      : pointToKataGo(
          move.point,
          boardSize,
        ),
  ] as const;
}

export function buildKataGoGameQuery(
  record: SavedGameRecord,
  analyzeTurns: readonly number[],
  options: KataGoAnalysisOptions = {},
  id = `game-${record.id}`,
): KataGoQuery {
  const boardSize =
    record.settings.boardSize;
  const handicap = handicapPoints(
    boardSize,
    record.settings.handicap,
  );

  const overrideSettings:
    Record<string, unknown> = {};

  if (options.humanProfile) {
    overrideSettings.humanSLProfile =
      options.humanProfile;
    overrideSettings.ignorePreRootHistory =
      false;
    overrideSettings.rootNumSymmetriesToSample =
      2;
    overrideSettings.humanSLRootExploreProbWeightless =
      0.5;
    overrideSettings.humanSLCpuctPermanent =
      2.0;
  }

  return {
    id,
    initialStones:
      handicap.length >= 2
        ? handicap.map(
            (point) =>
              [
                'B',
                pointToKataGo(
                  point,
                  boardSize,
                ),
              ] as const,
          )
        : undefined,
    initialPlayer:
      handicap.length >= 2
        ? 'W'
        : 'B',
    moves: record.moves.map(
      (move) =>
        moveTuple(
          move,
          boardSize,
        ),
    ),
    rules: 'chinese',
    komi: record.settings.komi,
    whiteHandicapBonus: 0,
    boardXSize: boardSize,
    boardYSize: boardSize,
    analyzeTurns,
    maxVisits:
      options.maxVisits ??
      defaultVisits(boardSize),
    analysisPVLen:
      options.pvLength ?? 8,
    includeOwnership:
      options.includeOwnership ?? true,
    includePolicy:
      options.includePolicy ?? true,
    includePVVisits: true,
    overrideSettings:
      Object.keys(overrideSettings).length > 0
        ? overrideSettings
        : undefined,
  } as KataGoQuery & {
    readonly whiteHandicapBonus: number;
  };
}

export function buildForcedMoveQuery(
  record: SavedGameRecord,
  moveNumber: number,
  options: KataGoAnalysisOptions = {},
): KataGoQuery | null {
  const index = moveNumber - 1;
  const actual = record.moves[index];

  if (!actual) return null;

  const prefixRecord: SavedGameRecord = {
    ...record,
    moves: record.moves.slice(0, index),
  };

  const coordinate =
    actual.type === 'pass'
      ? 'pass'
      : pointToKataGo(
          actual.point,
          record.settings.boardSize,
        );

  const query = buildKataGoGameQuery(
    prefixRecord,
    [index],
    {
      ...options,
      maxVisits: Math.max(
        100,
        Math.min(
          options.maxVisits ?? 250,
          300,
        ),
      ),
      includeOwnership: false,
    },
    `game-${record.id}-m${moveNumber}-actual`,
  );

  return {
    ...query,
    allowMoves: [{
      player: color(actual.player),
      moves: [coordinate],
      untilDepth: 1,
    }],
  };
}
