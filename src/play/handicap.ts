import type { Point } from '../go/engine';
import type { IndependentBoardSize } from './types';

function starDistance(size: IndependentBoardSize): number {
  return size === 9 ? 2 : 3;
}

export function handicapPoints(
  size: IndependentBoardSize,
  handicap: number,
): Point[] {
  if (!Number.isInteger(handicap) || handicap < 0 || handicap > 9) {
    throw new RangeError('Handicap must be an integer from 0 to 9.');
  }

  if (handicap <= 1) return [];

  const d = starDistance(size);
  const far = size - 1 - d;
  const mid = Math.floor(size / 2);

  const upperLeft = { x: d, y: d };
  const upperRight = { x: far, y: d };
  const lowerLeft = { x: d, y: far };
  const lowerRight = { x: far, y: far };
  const middleLeft = { x: d, y: mid };
  const middleRight = { x: far, y: mid };
  const upperMiddle = { x: mid, y: d };
  const lowerMiddle = { x: mid, y: far };
  const center = { x: mid, y: mid };

  const layouts: Readonly<Record<number, readonly Point[]>> = {
    2: [upperRight, lowerLeft],
    3: [upperRight, lowerLeft, lowerRight],
    4: [upperLeft, upperRight, lowerLeft, lowerRight],
    5: [upperLeft, upperRight, lowerLeft, lowerRight, center],
    6: [
      upperLeft,
      upperRight,
      lowerLeft,
      lowerRight,
      middleLeft,
      middleRight,
    ],
    7: [
      upperLeft,
      upperRight,
      lowerLeft,
      lowerRight,
      middleLeft,
      middleRight,
      center,
    ],
    8: [
      upperLeft,
      upperRight,
      lowerLeft,
      lowerRight,
      middleLeft,
      middleRight,
      upperMiddle,
      lowerMiddle,
    ],
    9: [
      upperLeft,
      upperRight,
      lowerLeft,
      lowerRight,
      middleLeft,
      middleRight,
      upperMiddle,
      lowerMiddle,
      center,
    ],
  };

  return [...(layouts[handicap] ?? [])];
}

export function effectiveKomi(
  handicap: number,
  requestedKomi: number,
): number {
  return handicap >= 2 ? 0.5 : requestedKomi;
}
