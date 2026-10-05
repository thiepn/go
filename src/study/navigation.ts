import type {
  StudyNode,
} from './types';
import {
  findStudyPath,
} from './tree';

export function parentNodeId(
  root: StudyNode,
  nodeId: string,
): string | null {
  const path = findStudyPath(
    root,
    nodeId,
  );

  if (!path || path.length < 2) {
    return null;
  }

  return path[path.length - 2].id;
}

export function nextMainNodeId(
  root: StudyNode,
  nodeId: string,
): string | null {
  const path = findStudyPath(
    root,
    nodeId,
  );
  const current = path?.at(-1);

  return current?.children[0]?.id ?? null;
}

export interface FlatStudyNode {
  readonly node: StudyNode;
  readonly depth: number;
  readonly moveNumber: number;
  readonly variationIndex: number;
}

export function flattenStudyTree(
  root: StudyNode,
): FlatStudyNode[] {
  const result: FlatStudyNode[] = [];

  const walk = (
    node: StudyNode,
    depth: number,
    moveNumber: number,
    variationIndex: number,
  ) => {
    result.push({
      node,
      depth,
      moveNumber,
      variationIndex,
    });

    node.children.forEach(
      (child, index) =>
        walk(
          child,
          depth + 1,
          moveNumber + (child.move ? 1 : 0),
          index,
        ),
    );
  };

  walk(root, 0, 0, 0);
  return result;
}
