import type { Point } from '../go/engine';

const GO_COLUMNS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';

export function pointToKataGo(
  point: Point,
  boardSize: number,
): string {
  const column = GO_COLUMNS[point.x];

  if (
    !column ||
    point.y < 0 ||
    point.y >= boardSize
  ) {
    throw new RangeError(
      `Point (${point.x}, ${point.y}) is outside the supported ${boardSize}×${boardSize} KataGo board.`,
    );
  }

  return `${column}${boardSize - point.y}`;
}

export function kataGoToPoint(
  coordinate: string,
  boardSize: number,
): Point | null {
  if (coordinate.toLowerCase() === 'pass') {
    return null;
  }

  const match = /^([A-Za-z]+)(\d+)$/.exec(
    coordinate.trim(),
  );

  if (!match) {
    throw new Error(
      `Invalid KataGo coordinate "${coordinate}".`,
    );
  }

  const column = match[1].toUpperCase();
  const x = GO_COLUMNS.indexOf(column);
  const row = Number(match[2]);
  const y = boardSize - row;

  if (
    x < 0 ||
    x >= boardSize ||
    !Number.isInteger(row) ||
    row < 1 ||
    row > boardSize
  ) {
    throw new RangeError(
      `KataGo coordinate "${coordinate}" is outside a ${boardSize}×${boardSize} board.`,
    );
  }

  return { x, y };
}
