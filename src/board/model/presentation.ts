import type { Point, Stone } from '../../go/engine';

export type BoardHighlightKind =
  | 'focus'
  | 'liberty'
  | 'warning'
  | 'success'
  | 'selected';

export interface BoardHighlight {
  readonly point: Point;
  readonly kind: BoardHighlightKind;
  readonly pulse?: boolean;
}

export interface GroupHighlight {
  readonly stones: readonly Point[];
  readonly kind?: 'focus' | 'warning' | 'success';
}

export interface BoardMarker {
  readonly point: Point;
  readonly label?: string;
  readonly tone?: 'neutral' | 'accent' | 'warning';
}

export interface GhostStone {
  readonly point: Point;
  readonly color: Stone;
}
