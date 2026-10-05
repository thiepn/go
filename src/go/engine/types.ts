export type Stone = 'black' | 'white';

export type Intersection = Stone | null;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export function opponent(stone: Stone): Stone {
  return stone === 'black' ? 'white' : 'black';
}
