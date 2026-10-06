import type { Point, Stone } from '../go/engine';
import {
  createStudyDocument,
  createStudyNodeId,
} from '../study/tree';
import type {
  StudyDocument,
  StudyMark,
  StudyNode,
  StudySetup,
} from '../study/types';
import { sgfToPoint } from './coordinates';

interface RawNode {
  readonly properties: Readonly<Record<string, readonly string[]>>;
  readonly children: readonly RawNode[];
}

interface MutableNode {
  properties: Record<string, string[]>;
  children: MutableNode[];
}

class SgfReader {
  private index = 0;

  public constructor(
    private readonly source: string,
  ) {}

  private peek(): string {
    return this.source[this.index] ?? '';
  }

  private take(): string {
    const value = this.peek();
    this.index += 1;
    return value;
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.peek())) {
      this.index += 1;
    }
  }

  private expect(char: string): void {
    this.skipWhitespace();

    if (this.take() !== char) {
      throw new Error(
        `Expected "${char}" near SGF offset ${this.index}.`,
      );
    }
  }

  private propertyValue(): string {
    this.expect('[');
    let value = '';

    while (this.index < this.source.length) {
      const char = this.take();

      if (char === ']') {
        return value;
      }

      if (char === '\\') {
        const escaped = this.take();

        if (escaped === '\r') {
          if (this.peek() === '\n') this.take();
          continue;
        }

        if (escaped === '\n') {
          continue;
        }

        value += escaped;
        continue;
      }

      value += char;
    }

    throw new Error('Unterminated SGF property value.');
  }

  private node(): MutableNode {
    this.expect(';');
    const properties: Record<string, string[]> = {};

    while (true) {
      this.skipWhitespace();
      const start = this.index;

      while (/[A-Za-z]/.test(this.peek())) {
        this.index += 1;
      }

      if (this.index === start) break;

      const ident = this.source
        .slice(start, this.index)
        .toUpperCase();

      this.skipWhitespace();
      const values: string[] = [];

      while (this.peek() === '[') {
        values.push(this.propertyValue());
        this.skipWhitespace();
      }

      if (values.length === 0) {
        throw new Error(
          `SGF property ${ident} has no value.`,
        );
      }

      properties[ident] = [
        ...(properties[ident] ?? []),
        ...values,
      ];
    }

    return {
      properties,
      children: [],
    };
  }

  private tree(): MutableNode {
    this.expect('(');
    this.skipWhitespace();

    const sequence: MutableNode[] = [];

    while (this.peek() === ';') {
      sequence.push(this.node());
      this.skipWhitespace();
    }

    if (sequence.length === 0) {
      throw new Error('SGF game tree contains no nodes.');
    }

    for (let index = 0; index < sequence.length - 1; index += 1) {
      sequence[index].children.push(
        sequence[index + 1],
      );
    }

    const tail = sequence[sequence.length - 1];

    while (this.peek() === '(') {
      tail.children.push(this.tree());
      this.skipWhitespace();
    }

    this.expect(')');
    return sequence[0];
  }

  public collection(): MutableNode[] {
    const trees: MutableNode[] = [];
    this.skipWhitespace();

    while (this.index < this.source.length) {
      if (this.peek() !== '(') {
        throw new Error(
          `Unexpected SGF content near offset ${this.index}.`,
        );
      }

      trees.push(this.tree());
      this.skipWhitespace();
    }

    if (trees.length === 0) {
      throw new Error('SGF collection is empty.');
    }

    return trees;
  }
}

function first(
  properties: Readonly<Record<string, readonly string[]>>,
  key: string,
): string | undefined {
  return properties[key]?.[0];
}

function numeric(
  value: string | undefined,
  fallback: number,
): number {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `Invalid SGF numeric value: "${value}".`,
    );
  }

  return parsed;
}

function parseBoardSize(
  value: string | undefined,
): number {
  if (
    value === undefined ||
    value.trim() === ''
  ) {
    return 19;
  }

  const parts = value.split(':');

  if (parts.length > 2) {
    throw new Error(
      `Invalid SGF board size: "${value}".`,
    );
  }

  const width = Number(parts[0]);
  const height =
    parts.length === 2
      ? Number(parts[1])
      : width;

  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 2 ||
    width > 25 ||
    height < 2 ||
    height > 25
  ) {
    throw new Error(
      `Unsupported SGF board size: "${value}".`,
    );
  }

  if (width !== height) {
    throw new Error(
      `Rectangular SGF boards are not supported: "${value}".`,
    );
  }

  return width;
}

function expandPointValue(
  value: string,
  boardSize: number,
): Point[] {
  const separator = value.indexOf(':');

  if (separator < 0) {
    const point = sgfToPoint(value, boardSize);
    return point ? [point] : [];
  }

  const start = sgfToPoint(
    value.slice(0, separator),
    boardSize,
  );
  const end = sgfToPoint(
    value.slice(separator + 1),
    boardSize,
  );

  if (!start || !end) return [];

  const points: Point[] = [];

  for (
    let y = Math.min(start.y, end.y);
    y <= Math.max(start.y, end.y);
    y += 1
  ) {
    for (
      let x = Math.min(start.x, end.x);
      x <= Math.max(start.x, end.x);
      x += 1
    ) {
      points.push({ x, y });
    }
  }

  return points;
}

function parseSetup(
  properties: Readonly<Record<string, readonly string[]>>,
  boardSize: number,
): StudySetup | undefined {
  const points = (key: string) =>
    (properties[key] ?? []).flatMap(
      (value) => expandPointValue(value, boardSize),
    );

  const black = points('AB');
  const white = points('AW');
  const empty = points('AE');
  const player = first(properties, 'PL');
  const toPlay: Stone | undefined =
    player === 'B'
      ? 'black'
      : player === 'W'
        ? 'white'
        : undefined;

  if (
    black.length === 0 &&
    white.length === 0 &&
    empty.length === 0 &&
    !toPlay
  ) {
    return undefined;
  }

  return {
    black,
    white,
    empty,
    toPlay,
  };
}

function parseMarks(
  properties: Readonly<Record<string, readonly string[]>>,
  boardSize: number,
): StudyMark[] {
  const marks: StudyMark[] = [];

  const addSimple = (
    property: string,
    kind: StudyMark['kind'],
  ) => {
    for (const value of properties[property] ?? []) {
      for (const point of expandPointValue(
        value,
        boardSize,
      )) {
        marks.push({ point, kind });
      }
    }
  };

  addSimple('TR', 'triangle');
  addSimple('SQ', 'square');
  addSimple('CR', 'circle');
  addSimple('MA', 'cross');

  for (const value of properties.LB ?? []) {
    const separator = value.indexOf(':');
    if (separator <= 0) continue;

    const point = sgfToPoint(
      value.slice(0, separator),
      boardSize,
    );

    if (!point) continue;

    marks.push({
      point,
      kind: 'label',
      label: value.slice(separator + 1),
    });
  }

  return marks;
}

function rawToStudyNode(
  raw: RawNode,
  boardSize: number,
): StudyNode {
  const blackMove = first(raw.properties, 'B');
  const whiteMove = first(raw.properties, 'W');
  const moveColor: Stone | null =
    blackMove !== undefined
      ? 'black'
      : whiteMove !== undefined
        ? 'white'
        : null;
  const moveValue =
    blackMove !== undefined
      ? blackMove
      : whiteMove;

  const marks = parseMarks(
    raw.properties,
    boardSize,
  );

  return {
    id: createStudyNodeId('sgf'),
    move:
      moveColor && moveValue !== undefined
        ? {
            color: moveColor,
            point: sgfToPoint(
              moveValue,
              boardSize,
            ),
          }
        : undefined,
    setup: parseSetup(
      raw.properties,
      boardSize,
    ),
    comment: first(raw.properties, 'C'),
    marks:
      marks.length > 0
        ? marks
        : undefined,
    children: raw.children.map((child) =>
      rawToStudyNode(child, boardSize),
    ),
  };
}

function rawTreeToDocument(
  raw: RawNode,
  index: number,
): StudyDocument {
  const boardSize = parseBoardSize(
    first(raw.properties, 'SZ'),
  );
  const komi = numeric(
    first(raw.properties, 'KM'),
    6.5,
  );
  const gameName = first(raw.properties, 'GN');
  const now = Date.now();

  const root = rawToStudyNode(
    raw,
    boardSize,
  );

  return createStudyDocument({
    title:
      gameName?.trim() ||
      `Imported study ${index + 1}`,
    boardSize,
    komi,
    root,
    now,
    metadata: {
      boardSize,
      komi,
      gameName,
      blackName: first(raw.properties, 'PB'),
      whiteName: first(raw.properties, 'PW'),
      result: first(raw.properties, 'RE'),
      date: first(raw.properties, 'DT'),
      rules: first(raw.properties, 'RU'),
      source: 'SGF import',
    },
  });
}

export function parseSgfCollection(
  source: string,
): StudyDocument[] {
  const trees = new SgfReader(source).collection();

  return trees.map((tree, index) =>
    rawTreeToDocument(tree, index),
  );
}

export function parseSgf(
  source: string,
): StudyDocument {
  return parseSgfCollection(source)[0];
}
