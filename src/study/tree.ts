import type {
  StudyDocument,
  StudyMark,
  StudyNode,
} from './types';

let nodeCounter = 0;

export function createStudyNodeId(
  prefix = 'node',
): string {
  nodeCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${nodeCounter.toString(36)}`;
}

export function createStudyDocument(
  options: {
    readonly title?: string;
    readonly boardSize?: number;
    readonly komi?: number;
    readonly root?: StudyNode;
    readonly metadata?: Partial<StudyDocument['metadata']>;
    readonly now?: number;
  } = {},
): StudyDocument {
  const now = options.now ?? Date.now();
  const boardSize = options.boardSize ?? 9;
  const komi = options.komi ?? 6.5;

  return {
    id: `study-${now.toString(36)}-${createStudyNodeId('doc')}`,
    title: options.title ?? 'Untitled study',
    metadata: {
      boardSize,
      komi,
      ...options.metadata,
    },
    root:
      options.root ?? {
        id: createStudyNodeId('root'),
        children: [],
      },
    createdAt: now,
    updatedAt: now,
  };
}

export function findStudyNode(
  root: StudyNode,
  nodeId: string,
): StudyNode | null {
  if (root.id === nodeId) return root;

  for (const child of root.children) {
    const found = findStudyNode(child, nodeId);
    if (found) return found;
  }

  return null;
}

export function findStudyPath(
  root: StudyNode,
  nodeId: string,
): StudyNode[] | null {
  if (root.id === nodeId) return [root];

  for (const child of root.children) {
    const path = findStudyPath(child, nodeId);
    if (path) return [root, ...path];
  }

  return null;
}

function updateNode(
  node: StudyNode,
  nodeId: string,
  updater: (node: StudyNode) => StudyNode,
): StudyNode {
  if (node.id === nodeId) {
    return updater(node);
  }

  let changed = false;
  const children = node.children.map((child) => {
    const next = updateNode(child, nodeId, updater);
    if (next !== child) changed = true;
    return next;
  });

  return changed
    ? {
        ...node,
        children,
      }
    : node;
}

export function addStudyChild(
  document: StudyDocument,
  parentId: string,
  child: Omit<StudyNode, 'id'> & { readonly id?: string },
  now = Date.now(),
): {
  readonly document: StudyDocument;
  readonly childId: string;
} {
  const childId = child.id ?? createStudyNodeId();
  const nextChild: StudyNode = {
    ...child,
    id: childId,
  };

  const root = updateNode(
    document.root,
    parentId,
    (parent) => ({
      ...parent,
      children: [...parent.children, nextChild],
    }),
  );

  return {
    document: {
      ...document,
      root,
      updatedAt: now,
    },
    childId,
  };
}

export function updateStudyComment(
  document: StudyDocument,
  nodeId: string,
  comment: string,
  now = Date.now(),
): StudyDocument {
  return {
    ...document,
    root: updateNode(
      document.root,
      nodeId,
      (node) => ({
        ...node,
        comment,
      }),
    ),
    updatedAt: now,
  };
}

export function setStudyMarks(
  document: StudyDocument,
  nodeId: string,
  marks: readonly StudyMark[],
  now = Date.now(),
): StudyDocument {
  return {
    ...document,
    root: updateNode(
      document.root,
      nodeId,
      (node) => ({
        ...node,
        marks,
      }),
    ),
    updatedAt: now,
  };
}

export function updateStudyRootSetup(
  document: StudyDocument,
  setup: StudyNode['setup'],
  now = Date.now(),
): StudyDocument {
  return {
    ...document,
    root: {
      ...document.root,
      setup,
    },
    updatedAt: now,
  };
}

export function mainLine(
  root: StudyNode,
): StudyNode[] {
  const nodes = [root];
  let current = root;

  while (current.children.length > 0) {
    current = current.children[0];
    nodes.push(current);
  }

  return nodes;
}

export function nodeDepth(
  root: StudyNode,
  nodeId: string,
): number {
  const path = findStudyPath(root, nodeId);
  return path ? path.length - 1 : 0;
}
