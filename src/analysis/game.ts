import type {
  SavedGameRecord,
} from '../play/types';
import {
  analysisCacheKey,
  readAnalysisCache,
  writeAnalysisCache,
} from './cache';
import {
  pointToKataGo,
} from './coordinates';
import {
  normalizeKataGoResponse,
} from './normalize';
import {
  buildKataGoGameQuery,
} from './request';
import {
  classifyScoreLoss,
} from './review';
import type {
  KataGoAnalysisOptions,
  KataGoGameScan,
  KataGoMoveReview,
  KataGoPositionAnalysis,
  KataGoProvider,
} from './types';

function defaultVisits(
  boardSize: number,
): number {
  if (boardSize <= 9) return 250;
  if (boardSize <= 13) return 350;
  return 500;
}

function reviewableMoveNumbers(
  record: SavedGameRecord,
): number[] {
  return record.moves.flatMap(
    (move, index) =>
      record.settings.mode === 'computer' &&
      move.player !==
        record.settings.humanColor
        ? []
        : [index + 1],
  );
}

function moveReview(
  record: SavedGameRecord,
  moveNumber: number,
  position: KataGoPositionAnalysis,
): KataGoMoveReview {
  const move =
    record.moves[moveNumber - 1];

  const actualCoordinate =
    move.type === 'pass'
      ? 'pass'
      : pointToKataGo(
          move.point,
          record.settings.boardSize,
        );

  const actual =
    position.candidates.find(
      (candidate) =>
        candidate.coordinate.toLowerCase() ===
        actualCoordinate.toLowerCase(),
    ) ?? null;
  const best =
    position.candidates[0] ?? null;

  const scoreLoss =
    best?.scoreLead !== null &&
    best?.scoreLead !== undefined &&
    actual?.scoreLead !== null &&
    actual?.scoreLead !== undefined
      ? Math.max(
          0,
          best.scoreLead -
            actual.scoreLead,
        )
      : null;

  const winrateLoss =
    best?.winrate !== null &&
    best?.winrate !== undefined &&
    actual?.winrate !== null &&
    actual?.winrate !== undefined
      ? Math.max(
          0,
          best.winrate -
            actual.winrate,
        )
      : null;

  return {
    moveNumber,
    actualPoint:
      move.type === 'play'
        ? move.point
        : null,
    actualCoordinate,
    currentPlayer:
      position.currentPlayer,
    best,
    actual,
    scoreLoss,
    winrateLoss,
    assessment:
      classifyScoreLoss(scoreLoss),
    position,
  };
}

export async function analyzeSavedGameBatch(
  record: SavedGameRecord,
  provider: KataGoProvider,
  options: KataGoAnalysisOptions = {},
): Promise<KataGoGameScan> {
  const moveNumbers =
    reviewableMoveNumbers(record);
  const visits =
    options.maxVisits ??
    defaultVisits(
      record.settings.boardSize,
    );
  const humanProfile =
    options.humanProfile ?? null;
  const positions =
    new Map<
      number,
      KataGoPositionAnalysis
    >();
  const missingTurns: number[] = [];

  for (const moveNumber of moveNumbers) {
    const key = analysisCacheKey(
      record.id,
      moveNumber,
      visits,
      humanProfile,
      options.includeOwnership ??
        true,
      options.includePolicy ?? true,
    );
    const cached =
      readAnalysisCache(key);

    if (cached) {
      positions.set(
        moveNumber - 1,
        cached,
      );
    } else {
      missingTurns.push(
        moveNumber - 1,
      );
    }
  }

  if (missingTurns.length > 0) {
    const query =
      buildKataGoGameQuery(
        record,
        missingTurns,
        {
          ...options,
          maxVisits: visits,
        },
        `game-${record.id}-scan-${missingTurns.join('-')}`,
      );

    const responses =
      await provider.analyze(query);

    for (const raw of responses) {
      if (
        typeof raw.turnNumber !==
        'number' ||
        !missingTurns.includes(
          raw.turnNumber,
        )
      ) {
        continue;
      }

      const normalized =
        normalizeKataGoResponse(
          raw,
          record.settings.boardSize,
          humanProfile,
        );

      positions.set(
        raw.turnNumber,
        normalized,
      );

      writeAnalysisCache(
        analysisCacheKey(
          record.id,
          raw.turnNumber + 1,
          visits,
          humanProfile,
          options.includeOwnership ??
            true,
          options.includePolicy ??
            true,
        ),
        normalized,
      );
    }
  }

  const moves = moveNumbers.flatMap(
    (moveNumber) => {
      const position = positions.get(
        moveNumber - 1,
      );

      return position
        ? [
            moveReview(
              record,
              moveNumber,
              position,
            ),
          ]
        : [];
    },
  );

  return {
    recordId: record.id,
    moves,
    missingPlayedMoves: moves
      .filter(
        (move) =>
          move.actual === null,
      )
      .map(
        (move) => move.moveNumber,
      ),
    analyzedAt: Date.now(),
  };
}
