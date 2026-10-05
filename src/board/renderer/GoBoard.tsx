import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

import {
  getIntersection,
  indexToPoint,
  pointKey,
  type Board,
  type Point,
  type Stone,
} from '../../go/engine';
import {
  coordinateLabel,
  getBoardGeometry,
  getStarPoints,
  pointToSvg,
} from '../model/geometry';
import type {
  BoardHighlight,
  BoardMarker,
  GhostStone,
  GroupHighlight,
} from '../model/presentation';
import {
  diffBoards,
  type StoneAtPoint,
} from '../model/transitions';
import '../styles/board.css';

export interface GoBoardProps {
  readonly board: Board;
  readonly label?: string;
  readonly interactive?: boolean;
  readonly placementColor?: Stone;
  readonly lastMove?: Point | null;
  readonly highlights?: readonly BoardHighlight[];
  readonly groupHighlights?: readonly GroupHighlight[];
  readonly markers?: readonly BoardMarker[];
  readonly ghostStone?: GhostStone | null;
  readonly showPlacementGhost?: boolean;
  readonly showCoordinates?: boolean;
  readonly onIntersectionIntent?: (point: Point) => void;
  readonly onFocusPointChange?: (point: Point) => void;
}

const EXIT_DURATION_MS = 210;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function StoneShape({
  point,
  color,
  radius,
  cx,
  cy,
  entering = false,
  exiting = false,
  blackFill,
  whiteFill,
}: {
  readonly point: Point;
  readonly color: Stone;
  readonly radius: number;
  readonly cx: number;
  readonly cy: number;
  readonly entering?: boolean;
  readonly exiting?: boolean;
  readonly blackFill: string;
  readonly whiteFill: string;
}) {
  const className = [
    'go-stone',
    `go-stone--${color}`,
    entering ? 'go-stone--entering' : '',
    exiting ? 'go-stone--exiting' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g
      className={className}
      data-point={pointKey(point)}
      aria-hidden="true"
    >
      <circle
        className="go-stone__shadow"
        cx={cx + radius * 0.08}
        cy={cy + radius * 0.12}
        r={radius * 0.97}
      />
      <circle
        className="go-stone__body"
        cx={cx}
        cy={cy}
        r={radius}
        fill={color === 'black' ? blackFill : whiteFill}
      />
      <ellipse
        className="go-stone__shine"
        cx={cx - radius * 0.26}
        cy={cy - radius * 0.3}
        rx={radius * 0.34}
        ry={radius * 0.24}
      />
    </g>
  );
}

export function GoBoard({
  board,
  label = 'Go board',
  interactive = false,
  placementColor = 'black',
  lastMove = null,
  highlights = [],
  groupHighlights = [],
  markers = [],
  ghostStone = null,
  showPlacementGhost = true,
  showCoordinates = false,
  onIntersectionIntent,
  onFocusPointChange,
}: GoBoardProps) {
  const geometry = useMemo(() => getBoardGeometry(board.size), [board.size]);
  const idPrefix = useId().replace(/:/g, '');
  const shadowId = `${idPrefix}-board-shadow`;
  const blackStoneId = `${idPrefix}-black-stone`;
  const whiteStoneId = `${idPrefix}-white-stone`;
  const surfaceId = `${idPrefix}-surface`;
  const blackStoneFill = `url(#${blackStoneId})`;
  const whiteStoneFill = `url(#${whiteStoneId})`;
  const previousBoardRef = useRef<Board | null>(null);
  const [entered, setEntered] = useState<readonly StoneAtPoint[]>([]);
  const [exiting, setExiting] = useState<readonly StoneAtPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [focusPoint, setFocusPoint] = useState<Point>({
    x: Math.floor(board.size / 2),
    y: Math.floor(board.size / 2),
  });

  const starPoints = useMemo(() => getStarPoints(board.size), [board.size]);

  useEffect(() => {
    const diff = diffBoards(previousBoardRef.current, board);
    previousBoardRef.current = board;

    setEntered(diff.entered);
    setExiting(diff.exited);

    if (diff.entered.length > 0) {
      const timer = window.setTimeout(() => setEntered([]), EXIT_DURATION_MS);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [board]);

  useEffect(() => {
    if (exiting.length === 0) return undefined;

    const timer = window.setTimeout(() => setExiting([]), EXIT_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [exiting]);

  useEffect(() => {
    onFocusPointChange?.(focusPoint);
  }, [focusPoint, onFocusPointChange]);

  const enteredKeys = useMemo(
    () => new Set(entered.map((stone) => pointKey(stone.point))),
    [entered],
  );

  const moveFocus = (dx: number, dy: number) => {
    setFocusPoint((current) => ({
      x: clamp(current.x + dx, 0, board.size - 1),
      y: clamp(current.y + dy, 0, board.size - 1),
    }));
  };

  const activate = (point: Point) => {
    if (!interactive) return;
    onIntersectionIntent?.(point);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveFocus(-1, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveFocus(1, 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(0, -1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(0, 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activate(focusPoint);
        break;
      default:
        break;
    }
  };

  const focusedValue = getIntersection(board, focusPoint);
  const statusText = interactive
    ? `${coordinateLabel(focusPoint, board.size)}, ${focusedValue ?? 'empty'}. Arrow keys move, Enter or Space selects.`
    : label;

  const renderGroupHalo = (point: Point, group: GroupHighlight) => {
    const { x, y } = pointToSvg(geometry, point);
    const tone = group.kind ?? 'focus';
    const groupKeys = new Set(group.stones.map(pointKey));

    const bridges = [
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
    ].flatMap(({ dx, dy }) => {
      const neighbor = { x: point.x + dx, y: point.y + dy };

      if (!groupKeys.has(pointKey(neighbor))) return [];

      const target = pointToSvg(geometry, neighbor);

      return [
        <line
          key={`bridge-${pointKey(point)}-${pointKey(neighbor)}`}
          className={`go-group-halo go-group-halo--${tone}`}
          x1={x}
          y1={y}
          x2={target.x}
          y2={target.y}
          strokeWidth={geometry.stoneRadius * 1.55}
          strokeLinecap="round"
        />,
      ];
    });

    return (
      <g key={`group-${pointKey(point)}`} aria-hidden="true">
        {bridges}
        <circle
          className={`go-group-halo go-group-halo--${tone}`}
          cx={x}
          cy={y}
          r={geometry.stoneRadius * 1.08}
        />
      </g>
    );
  };

  const hoveredGhost: GhostStone | null =
    interactive &&
    showPlacementGhost &&
    hoveredPoint &&
    getIntersection(board, hoveredPoint) === null
      ? { point: hoveredPoint, color: placementColor }
      : null;

  const keyboardGhost: GhostStone | null =
    interactive &&
    showPlacementGhost &&
    getIntersection(board, focusPoint) === null &&
    !hoveredGhost
      ? { point: focusPoint, color: placementColor }
      : null;

  const visibleGhost = ghostStone ?? hoveredGhost ?? keyboardGhost;

  return (
    <div
      className="go-board-shell"
      role="group"
      aria-label={label}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={onKeyDown}
    >
      <svg
        className="go-board"
        viewBox="0 0 1000 1000"
        role="img"
        aria-label={label}
      >
        <defs>
          <filter id={shadowId} x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow
              dx="0"
              dy="12"
              stdDeviation="18"
              floodColor="#241b0f"
              floodOpacity="0.18"
            />
          </filter>
          <radialGradient id={blackStoneId} cx="32%" cy="26%" r="75%">
            <stop offset="0%" stopColor="#50514b" />
            <stop offset="48%" stopColor="#242521" />
            <stop offset="100%" stopColor="#11120f" />
          </radialGradient>
          <radialGradient id={whiteStoneId} cx="32%" cy="24%" r="80%">
            <stop offset="0%" stopColor="#fffef9" />
            <stop offset="58%" stopColor="#f4efe5" />
            <stop offset="100%" stopColor="#d8d1c5" />
          </radialGradient>
          <linearGradient id={surfaceId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e6bf7d" />
            <stop offset="52%" stopColor="#d9ad66" />
            <stop offset="100%" stopColor="#c99854" />
          </linearGradient>
        </defs>

        <rect
          className="go-board__surface"
          x="18"
          y="18"
          width="964"
          height="964"
          rx="34"
          fill={`url(#${surfaceId})`}
          filter={`url(#${shadowId})`}
        />

        <g className="go-board__grain" aria-hidden="true">
          <path d="M80 208 C270 184 690 218 920 187" />
          <path d="M64 450 C310 420 640 470 936 438" />
          <path d="M92 742 C318 716 714 760 916 724" />
        </g>

        <g className="go-board__grid" aria-hidden="true">
          {Array.from({ length: board.size }, (_, index) => {
            const offset = geometry.inset + index * geometry.spacing;

            return (
              <g key={`grid-${index}`}>
                <line
                  x1={geometry.inset}
                  y1={offset}
                  x2={geometry.inset + geometry.gridSize}
                  y2={offset}
                />
                <line
                  x1={offset}
                  y1={geometry.inset}
                  x2={offset}
                  y2={geometry.inset + geometry.gridSize}
                />
              </g>
            );
          })}
        </g>

        <g className="go-board__stars" aria-hidden="true">
          {starPoints.map((point) => {
            const position = pointToSvg(geometry, point);

            return (
              <circle
                key={`star-${pointKey(point)}`}
                cx={position.x}
                cy={position.y}
                r={Math.max(5, geometry.spacing * 0.07)}
              />
            );
          })}
        </g>

        {showCoordinates && (
          <g className="go-board__coordinates" aria-hidden="true">
            {Array.from({ length: board.size }, (_, index) => {
              const topPoint = { x: index, y: 0 };
              const sidePoint = { x: 0, y: index };
              const xPosition = pointToSvg(geometry, topPoint).x;
              const yPosition = pointToSvg(geometry, sidePoint).y;

              return (
                <g key={`coord-${index}`}>
                  <text x={xPosition} y="42" textAnchor="middle">
                    {coordinateLabel(topPoint, board.size).replace(/\d+$/, '')}
                  </text>
                  <text x="38" y={yPosition + 7} textAnchor="middle">
                    {board.size - index}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        <g className="go-board__group-highlights">
          {groupHighlights.flatMap((group) =>
            group.stones.map((point) => renderGroupHalo(point, group)),
          )}
        </g>

        <g className="go-board__highlights" aria-hidden="true">
          {highlights.map((highlight) => {
            const position = pointToSvg(geometry, highlight.point);

            return (
              <circle
                key={`highlight-${pointKey(highlight.point)}-${highlight.kind}`}
                className={[
                  'go-highlight',
                  `go-highlight--${highlight.kind}`,
                  highlight.pulse ? 'go-highlight--pulse' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                cx={position.x}
                cy={position.y}
                r={geometry.spacing * 0.24}
              />
            );
          })}
        </g>

        <g className="go-board__stones">
          {board.intersections.map((value, index) => {
            if (!value) return null;

            const point = indexToPoint(board, index);
            const position = pointToSvg(geometry, point);

            return (
              <StoneShape
                key={`stone-${pointKey(point)}-${value}`}
                point={point}
                color={value}
                radius={geometry.stoneRadius}
                cx={position.x}
                cy={position.y}
                entering={enteredKeys.has(pointKey(point))}
                blackFill={blackStoneFill}
                whiteFill={whiteStoneFill}
              />
            );
          })}

          {exiting.map((stone) => {
            const position = pointToSvg(geometry, stone.point);

            return (
              <StoneShape
                key={`exit-${pointKey(stone.point)}-${stone.color}`}
                point={stone.point}
                color={stone.color}
                radius={geometry.stoneRadius}
                cx={position.x}
                cy={position.y}
                exiting
                blackFill={blackStoneFill}
                whiteFill={whiteStoneFill}
              />
            );
          })}
        </g>

        {visibleGhost && getIntersection(board, visibleGhost.point) === null && (
          <g className="go-board__ghost" aria-hidden="true">
            {(() => {
              const position = pointToSvg(geometry, visibleGhost.point);
              return (
                <circle
                  className={`go-ghost-stone go-ghost-stone--${visibleGhost.color}`}
                  cx={position.x}
                  cy={position.y}
                  r={geometry.stoneRadius}
                />
              );
            })()}
          </g>
        )}

        <g className="go-board__markers" aria-hidden="true">
          {lastMove &&
            (() => {
              const position = pointToSvg(geometry, lastMove);
              const stone = getIntersection(board, lastMove);

              if (!stone) return null;

              return (
                <circle
                  className={`go-last-move go-last-move--on-${stone}`}
                  cx={position.x}
                  cy={position.y}
                  r={Math.max(6, geometry.stoneRadius * 0.16)}
                />
              );
            })()}

          {markers.map((marker) => {
            const position = pointToSvg(geometry, marker.point);

            return marker.label ? (
              <text
                key={`marker-${pointKey(marker.point)}`}
                className={`go-marker go-marker--${marker.tone ?? 'neutral'}`}
                x={position.x}
                y={position.y + geometry.stoneRadius * 0.16}
                textAnchor="middle"
              >
                {marker.label}
              </text>
            ) : (
              <circle
                key={`marker-${pointKey(marker.point)}`}
                className={`go-marker-dot go-marker-dot--${marker.tone ?? 'neutral'}`}
                cx={position.x}
                cy={position.y}
                r={geometry.stoneRadius * 0.2}
              />
            );
          })}
        </g>

        {interactive && (
          <g className="go-board__targets">
            {board.intersections.map((_, index) => {
              const point = indexToPoint(board, index);
              const position = pointToSvg(geometry, point);

              return (
                <circle
                  key={`target-${pointKey(point)}`}
                  className="go-board__target"
                  cx={position.x}
                  cy={position.y}
                  r={geometry.hitRadius}
                  onPointerEnter={(event: PointerEvent<SVGCircleElement>) => {
                    if (event.pointerType !== 'touch') {
                      setHoveredPoint(point);
                    }
                  }}
                  onPointerLeave={() => setHoveredPoint(null)}
                  onPointerDown={() => setFocusPoint(point)}
                  onClick={() => activate(point)}
                />
              );
            })}
          </g>
        )}

        {interactive && (
          <g className="go-board__keyboard-cursor" aria-hidden="true">
            {(() => {
              const position = pointToSvg(geometry, focusPoint);

              return (
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={geometry.stoneRadius * 1.13}
                />
              );
            })()}
          </g>
        )}
      </svg>

      <span className="sr-only" aria-live="polite">
        {statusText}
      </span>
    </div>
  );
}
