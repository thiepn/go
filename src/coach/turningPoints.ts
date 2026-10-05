import type {
  KataGoGameScan,
} from '../analysis/types';
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
  CoachTurningPoint,
} from './types';

function deterministicImportance(
  finding: ReviewFinding,
  focusConceptId: string,
  gameIndex: number,
): number {
  const severity =
    finding.severity === 'mistake'
      ? 5
      : finding.severity === 'warning'
        ? 3
        : 1.4;

  return (
    severity +
    (finding.confidence === 'high'
      ? 1
      : 0) +
    (finding.conceptId ===
    focusConceptId
      ? 2.2
      : 0) +
    Math.max(
      0.3,
      1.4 - gameIndex * 0.22,
    )
  );
}

function deterministicPoint(
  game: SavedGameRecord,
  finding: ReviewFinding,
  focusConceptId: string,
  gameIndex: number,
): CoachTurningPoint {
  return {
    id: `${game.id}:m${finding.moveNumber}:deterministic`,
    gameId: game.id,
    playedAt: game.playedAt,
    moveNumber:
      finding.moveNumber,
    source: 'deterministic',
    title: finding.title,
    explanation:
      finding.summary,
    conceptId:
      finding.conceptId,
    findingKind:
      finding.kind,
    severity:
      finding.severity,
    scoreLoss: null,
    importance:
      deterministicImportance(
        finding,
        focusConceptId,
        gameIndex,
      ),
  };
}

export function selectCoachTurningPoints(
  games: readonly SavedGameRecord[],
  focusConceptId: string,
  engineScans: readonly KataGoGameScan[] = [],
  limit = 4,
): CoachTurningPoint[] {
  const points: CoachTurningPoint[] =
    [];

  games.slice(0, 5).forEach(
    (game, gameIndex) => {
      const review =
        reviewSavedGame(game);

      for (const finding of review.findings) {
        points.push(
          deterministicPoint(
            game,
            finding,
            focusConceptId,
            gameIndex,
          ),
        );
      }
    },
  );

  const byMoment = new Map(
    points.map((point) => [
      `${point.gameId}:${point.moveNumber}`,
      point,
    ]),
  );

  for (const scan of engineScans) {
    const game = games.find(
      (item) =>
        item.id === scan.recordId,
    );

    if (!game) continue;

    for (const move of scan.moves) {
      if (
        move.scoreLoss === null ||
        move.scoreLoss < 3.5
      ) {
        continue;
      }

      const key =
        `${game.id}:${move.moveNumber}`;
      const existing =
        byMoment.get(key);
      const engineBoost =
        Math.min(
          4,
          move.scoreLoss / 2.5,
        );

      if (existing) {
        const combined: CoachTurningPoint = {
          ...existing,
          source: 'combined',
          scoreLoss:
            move.scoreLoss,
          importance:
            existing.importance +
            engineBoost,
          explanation:
            `${existing.explanation} KataGo also estimates roughly ${Math.round(move.scoreLoss * 10) / 10} points of loss here.`,
        };

        byMoment.set(
          key,
          combined,
        );
      } else {
        byMoment.set(
          key,
          {
            id: `${game.id}:m${move.moveNumber}:engine`,
            gameId: game.id,
            playedAt:
              game.playedAt,
            moveNumber:
              move.moveNumber,
            source: 'engine',
            title:
              move.assessment ===
              'major-mistake'
                ? 'Large engine turning point'
                : 'Engine improvement opportunity',
            explanation:
              `KataGo estimates roughly ${Math.round(move.scoreLoss * 10) / 10} points of difference from its preferred move. This makes the position worth studying, but the engine result alone does not identify a curriculum weakness.`,
            conceptId: null,
            scoreLoss:
              move.scoreLoss,
            importance:
              3.5 +
              engineBoost,
          },
        );
      }
    }
  }

  const perGame =
    new Map<string, number>();

  return [...byMoment.values()]
    .sort(
      (a, b) =>
        b.importance -
          a.importance ||
        b.playedAt -
          a.playedAt,
    )
    .filter((point) => {
      const count =
        perGame.get(point.gameId) ??
        0;

      if (count >= 2) {
        return false;
      }

      perGame.set(
        point.gameId,
        count + 1,
      );
      return true;
    })
    .slice(0, limit);
}
