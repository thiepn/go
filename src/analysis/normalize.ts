import type { Stone } from '../go/engine';
import {
  kataGoToPoint,
} from './coordinates';
import type {
  KataGoCandidate,
  KataGoPositionAnalysis,
  KataGoResponseRaw,
} from './types';

function finite(
  value: unknown,
): number | null {
  return typeof value === 'number' &&
    Number.isFinite(value)
    ? value
    : null;
}

function stone(
  color: unknown,
): Stone {
  return color === 'W'
    ? 'white'
    : 'black';
}

export function normalizeKataGoResponse(
  raw: KataGoResponseRaw,
  boardSize: number,
  humanProfile: string | null = null,
): KataGoPositionAnalysis {
  if (raw.error) {
    throw new Error(
      raw.field
        ? `${raw.error} (${raw.field})`
        : raw.error,
    );
  }

  const turnNumber =
    typeof raw.turnNumber === 'number'
      ? raw.turnNumber
      : 0;

  const candidates: KataGoCandidate[] =
    (raw.moveInfos ?? [])
      .filter(
        (item) =>
          typeof item.move === 'string',
      )
      .map((item, index) => {
        const coordinate = item.move as string;

        return {
          point: kataGoToPoint(
            coordinate,
            boardSize,
          ),
          coordinate,
          order:
            typeof item.order === 'number'
              ? item.order
              : index,
          visits:
            typeof item.visits === 'number'
              ? item.visits
              : 0,
          winrate: finite(item.winrate),
          scoreLead: finite(item.scoreLead),
          utility: finite(item.utility),
          prior: finite(item.prior),
          humanPrior: finite(item.humanPrior),
          pvCoordinates: [
            coordinate,
            ...(item.pv ?? []),
          ],
          pv: [
            coordinate,
            ...(item.pv ?? []),
          ].map((value) =>
            kataGoToPoint(
              value,
              boardSize,
            ),
          ),
        };
      })
      .sort(
        (a, b) =>
          a.order - b.order ||
          b.visits - a.visits,
      );

  return {
    queryId:
      typeof raw.id === 'string'
        ? raw.id
        : '',
    turnNumber,
    currentPlayer: stone(
      raw.rootInfo?.currentPlayer,
    ),
    boardSize,
    rootVisits:
      typeof raw.rootInfo?.visits === 'number'
        ? raw.rootInfo.visits
        : 0,
    rootWinrate: finite(
      raw.rootInfo?.winrate,
    ),
    rootScoreLead: finite(
      raw.rootInfo?.scoreLead,
    ),
    rootUtility: finite(
      raw.rootInfo?.utility,
    ),
    candidates,
    ownership:
      Array.isArray(raw.ownership)
        ? raw.ownership.filter(
            (value): value is number =>
              typeof value === 'number' &&
              Number.isFinite(value),
          )
        : null,
    policy:
      Array.isArray(raw.policy)
        ? raw.policy.filter(
            (value): value is number =>
              typeof value === 'number' &&
              Number.isFinite(value),
          )
        : null,
    humanPolicy:
      Array.isArray(raw.humanPolicy)
        ? raw.humanPolicy.filter(
            (value): value is number =>
              typeof value === 'number' &&
              Number.isFinite(value),
          )
        : null,
    humanProfile,
  };
}
