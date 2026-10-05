import {
  getIntersection,
  pointKey,
  type Point,
  type Stone,
} from '../go/engine';
import {
  addStudyChild,
  findStudyNode,
  setStudyMarks,
  updateStudyRootSetup,
} from './tree';
import { replayStudyPath } from './replay';
import type {
  StudyDocument,
  StudyMark,
  StudyMarkKind,
  StudySetup,
} from './types';

export type SetupEditMode =
  | 'black'
  | 'white'
  | 'erase';

function uniquePoints(
  points: readonly Point[],
): Point[] {
  const seen = new Set<string>();
  const result: Point[] = [];

  for (const point of points) {
    const key = pointKey(point);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(point);
  }

  return result;
}

function withoutPoint(
  points: readonly Point[] | undefined,
  point: Point,
): Point[] {
  const key = pointKey(point);
  return (points ?? []).filter(
    (candidate) => pointKey(candidate) !== key,
  );
}

export function editRootSetupPoint(
  document: StudyDocument,
  point: Point,
  mode: SetupEditMode,
  now = Date.now(),
): StudyDocument {
  const setup: StudySetup =
    document.root.setup ?? {};

  let black = withoutPoint(setup.black, point);
  let white = withoutPoint(setup.white, point);
  let empty = withoutPoint(setup.empty, point);

  if (mode === 'black') {
    black = uniquePoints([...black, point]);
  } else if (mode === 'white') {
    white = uniquePoints([...white, point]);
  } else {
    empty = uniquePoints([...empty, point]);
  }

  return updateStudyRootSetup(
    document,
    {
      ...setup,
      black,
      white,
      empty,
    },
    now,
  );
}

export function addStudyMoveVariation(
  document: StudyDocument,
  parentId: string,
  point: Point | null,
  now = Date.now(),
): {
  readonly document: StudyDocument;
  readonly childId: string;
  readonly existing: boolean;
} {
  const parent = findStudyNode(
    document.root,
    parentId,
  );

  if (!parent) {
    throw new Error(
      `Study parent "${parentId}" was not found.`,
    );
  }

  const game = replayStudyPath(
    document,
    parentId,
  );
  const color = game.toPlay;

  const existing = parent.children.find(
    (child) =>
      child.move?.color === color &&
      (
        (child.move.point === null && point === null) ||
        (
          child.move.point !== null &&
          point !== null &&
          child.move.point.x === point.x &&
          child.move.point.y === point.y
        )
      ),
  );

  if (existing) {
    return {
      document,
      childId: existing.id,
      existing: true,
    };
  }

  if (point !== null) {
    const value = getIntersection(
      game.board,
      point,
    );

    if (value !== null) {
      throw new Error(
        'There is already a stone on that intersection.',
      );
    }
  }

  const added = addStudyChild(
    document,
    parentId,
    {
      move: {
        color,
        point,
      },
      children: [],
    },
    now,
  );

  // Replaying the new node validates capture, suicide and ko legality.
  replayStudyPath(
    added.document,
    added.childId,
  );

  return {
    ...added,
    existing: false,
  };
}

export function toggleStudyMark(
  document: StudyDocument,
  nodeId: string,
  point: Point,
  kind: Exclude<StudyMarkKind, 'label'>,
  now = Date.now(),
): StudyDocument {
  const node = findStudyNode(
    document.root,
    nodeId,
  );

  if (!node) return document;

  const marks = [...(node.marks ?? [])];
  const key = pointKey(point);
  const index = marks.findIndex(
    (mark) =>
      pointKey(mark.point) === key &&
      mark.kind === kind,
  );

  if (index >= 0) {
    marks.splice(index, 1);
  } else {
    const filtered = marks.filter(
      (mark) =>
        pointKey(mark.point) !== key,
    );

    filtered.push({
      point,
      kind,
    });

    return setStudyMarks(
      document,
      nodeId,
      filtered,
      now,
    );
  }

  return setStudyMarks(
    document,
    nodeId,
    marks,
    now,
  );
}

export function setStudyLabel(
  document: StudyDocument,
  nodeId: string,
  point: Point,
  label: string,
  now = Date.now(),
): StudyDocument {
  const node = findStudyNode(
    document.root,
    nodeId,
  );
  if (!node) return document;

  const key = pointKey(point);
  const marks: StudyMark[] = (
    node.marks ?? []
  ).filter(
    (mark) =>
      pointKey(mark.point) !== key,
  );

  if (label.trim()) {
    marks.push({
      point,
      kind: 'label',
      label: label.trim(),
    });
  }

  return setStudyMarks(
    document,
    nodeId,
    marks,
    now,
  );
}

export function setRootToPlay(
  document: StudyDocument,
  color: Stone,
  now = Date.now(),
): StudyDocument {
  return updateStudyRootSetup(
    document,
    {
      ...(document.root.setup ?? {}),
      toPlay: color,
    },
    now,
  );
}
