import type { Point } from '../go/engine';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export function pointToSgf(
  point: Point,
): string {
  const x = LETTERS[point.x];
  const y = LETTERS[point.y];

  if (!x || !y) {
    throw new RangeError(
      `Point (${point.x}, ${point.y}) cannot be represented by the current SGF coordinate codec.`,
    );
  }

  return `${x}${y}`;
}

export function sgfToPoint(
  value: string,
  boardSize: number,
): Point | null {
  if (value === '') return null;
  if (value.length !== 2) {
    throw new Error(
      `Invalid SGF point "${value}".`,
    );
  }

  const x = LETTERS.indexOf(value[0].toLowerCase());
  const y = LETTERS.indexOf(value[1].toLowerCase());

  if (
    x < 0 ||
    y < 0 ||
    x >= boardSize ||
    y >= boardSize
  ) {
    throw new RangeError(
      `SGF point "${value}" is outside a ${boardSize}×${boardSize} board.`,
    );
  }

  return { x, y };
}
