import type { Point, Stone } from '../go/engine';

export type StudyMarkKind =
  | 'triangle'
  | 'square'
  | 'circle'
  | 'cross'
  | 'label';

export interface StudyMark {
  readonly point: Point;
  readonly kind: StudyMarkKind;
  readonly label?: string;
}

export interface StudyMove {
  readonly color: Stone;
  readonly point: Point | null;
}

export interface StudySetup {
  readonly black?: readonly Point[];
  readonly white?: readonly Point[];
  readonly empty?: readonly Point[];
  readonly toPlay?: Stone;
}

export interface StudyNode {
  readonly id: string;
  readonly move?: StudyMove;
  readonly setup?: StudySetup;
  readonly comment?: string;
  readonly marks?: readonly StudyMark[];
  readonly children: readonly StudyNode[];
}

export interface StudyMetadata {
  readonly boardSize: number;
  readonly komi: number;
  readonly gameName?: string;
  readonly blackName?: string;
  readonly whiteName?: string;
  readonly result?: string;
  readonly date?: string;
  readonly rules?: string;
  readonly source?: string;
}

export interface StudyDocument {
  readonly id: string;
  readonly title: string;
  readonly metadata: StudyMetadata;
  readonly root: StudyNode;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface StudyPathEntry {
  readonly node: StudyNode;
  readonly variationIndex: number;
}
