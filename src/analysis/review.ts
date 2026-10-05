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
  buildForcedMoveQuery,
  buildKataGoGameQuery,
} from './request';
import type {
  EngineMoveAssessment,
  KataGoAnalysisOptions,
  KataGoCandidate,
  KataGoMoveReview,
  KataGoPositionAnalysis,
  KataGoProvider,
} from './types';

function assessment(
  scoreLoss: number | null,
): EngineMoveAssessment {
  if (scoreLoss === null) {
    return 'unknown';
  }

  if (scoreLoss < 1.5) {
    return 'good';
  }

  if (scoreLoss < 3.5) {
    return 'small-loss';
  }

  if (scoreLoss < 8) {
    return 'mistake';
  }

  return 'major-mistake';
}

function sameCoordinate(
  candidate: KataGoCandidate,
  coordinate: string,
): boolean {
  return (
    candidate.coordinate.toLowerCase() ===
    coordinate.toLowerCase()
  );
}

function mergeActualCandidate(
  position: KataGoPositionAnalysis,
  actual:
    | KataGoCandidate
    | null,
): KataGoPositionAnalysis {
  if (
    !actual ||
    position.candidates.some(
      (candidate) =>
        sameCoordinate(
          candidate,
          actual.coordinate,
        ),
    )
  ) {
    return position;
  }

  return {
    ...position,
    candidates: [
      ...position.candidates,
      actual,
    ],
  };
}

export async function analyzeSavedGameMove(
  record: SavedGameRecord,
  moveNumber: number,
  provider: KataGoProvider,
  options: KataGoAnalysisOptions = {},
): Promise<KataGoMoveReview> {
  const index = moveNumber - 1;
  const move = record.moves[index];

  if (!move) {
    throw new RangeError(
      `Move ${moveNumber} is outside this game.`,
    );
  }

  const visits =
    options.maxVisits ??
    (record.settings.boardSize <= 9
      ? 250
      : record.settings.boardSize <= 13
        ? 350
        : 500);
  const humanProfile =
    options.humanProfile ?? null;
  const cacheKey = analysisCacheKey(
    record.id,
    moveNumber,
    visits,
    humanProfile,
    options.includeOwnership ?? true,
    options.includePolicy ?? true,
  );

  let position =
    readAnalysisCache(cacheKey);

  if (!position) {
    const query =
      buildKataGoGameQuery(
        record,
        [index],
        {
          ...options,
          maxVisits: visits,
        },
        `game-${record.id}-m${moveNumber}`,
      );
    const responses =
      await provider.analyze(query);
    const raw = responses.find(
      (item) =>
        item.turnNumber === index,
    );

    if (!raw) {
      throw new Error(
        `KataGo did not return analysis for move ${moveNumber}.`,
      );
    }

    position =
      normalizeKataGoResponse(
        raw,
        record.settings.boardSize,
        humanProfile,
      );
    writeAnalysisCache(
      cacheKey,
      position,
    );
  }

  const actualCoordinate =
    move.type === 'pass'
      ? 'pass'
      : pointToKataGo(
          move.point,
          record.settings.boardSize,
        );

  let actual =
    position.candidates.find(
      (candidate) =>
        sameCoordinate(
          candidate,
          actualCoordinate,
        ),
    ) ?? null;

  if (!actual) {
    const forced =
      buildForcedMoveQuery(
        record,
        moveNumber,
        {
          ...options,
          maxVisits: visits,
        },
      );

    if (forced) {
      const responses =
        await provider.analyze(
          forced,
        );
      const raw = responses.find(
        (item) =>
          typeof item.turnNumber ===
          'number',
      );

      if (raw) {
        const forcedPosition =
          normalizeKataGoResponse(
            raw,
            record.settings.boardSize,
            humanProfile,
          );

        actual =
          forcedPosition.candidates.find(
            (candidate) =>
              sameCoordinate(
                candidate,
                actualCoordinate,
              ),
          ) ??
          forcedPosition.candidates[0] ??
          null;

        position =
          mergeActualCandidate(
            position,
            actual,
          );
        writeAnalysisCache(
          cacheKey,
          position,
        );
      }
    }
  }

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
      assessment(scoreLoss),
    position,
  };
}
