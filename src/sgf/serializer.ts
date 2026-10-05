import type { StudyDocument, StudyNode } from '../study/types';
import { pointToSgf } from './coordinates';

function escapeValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\]/g, '\\]');
}

function prop(
  key: string,
  values: readonly string[] | undefined,
): string {
  if (!values || values.length === 0) return '';

  return `${key}${values
    .map((value) => `[${escapeValue(value)}]`)
    .join('')}`;
}

function propEscaped(
  key: string,
  values: readonly string[] | undefined,
): string {
  if (!values || values.length === 0) return '';

  return `${key}${values
    .map((value) => `[${value}]`)
    .join('')}`;
}

function escapeComposedPart(
  value: string,
): string {
  return escapeValue(value).replace(/:/g, '\\:');
}

function nodeProperties(
  node: StudyNode,
  rootMetadata?: StudyDocument['metadata'],
): string {
  const properties: string[] = [];

  if (rootMetadata) {
    properties.push(
      'FF[4]',
      'GM[1]',
      'CA[UTF-8]',
      'AP[THIEPN-Go:1]',
      prop('SZ', [String(rootMetadata.boardSize)]),
      prop('KM', [String(rootMetadata.komi)]),
      prop(
        'GN',
        rootMetadata.gameName
          ? [rootMetadata.gameName]
          : undefined,
      ),
      prop(
        'PB',
        rootMetadata.blackName
          ? [rootMetadata.blackName]
          : undefined,
      ),
      prop(
        'PW',
        rootMetadata.whiteName
          ? [rootMetadata.whiteName]
          : undefined,
      ),
      prop(
        'RE',
        rootMetadata.result
          ? [rootMetadata.result]
          : undefined,
      ),
      prop(
        'DT',
        rootMetadata.date
          ? [rootMetadata.date]
          : undefined,
      ),
      prop(
        'RU',
        rootMetadata.rules
          ? [rootMetadata.rules]
          : undefined,
      ),
    );
  }

  if (node.setup) {
    properties.push(
      prop(
        'AB',
        node.setup.black?.map(pointToSgf),
      ),
      prop(
        'AW',
        node.setup.white?.map(pointToSgf),
      ),
      prop(
        'AE',
        node.setup.empty?.map(pointToSgf),
      ),
      prop(
        'PL',
        node.setup.toPlay
          ? [node.setup.toPlay === 'black' ? 'B' : 'W']
          : undefined,
      ),
    );
  }

  if (node.move) {
    properties.push(
      prop(
        node.move.color === 'black' ? 'B' : 'W',
        [node.move.point ? pointToSgf(node.move.point) : ''],
      ),
    );
  }

  if (node.comment !== undefined && node.comment !== '') {
    properties.push(prop('C', [node.comment]));
  }

  const marks = node.marks ?? [];
  const simple = (
    kind: 'triangle' | 'square' | 'circle' | 'cross',
  ) =>
    marks
      .filter((mark) => mark.kind === kind)
      .map((mark) => pointToSgf(mark.point));

  properties.push(
    prop('TR', simple('triangle')),
    prop('SQ', simple('square')),
    prop('CR', simple('circle')),
    prop('MA', simple('cross')),
    propEscaped(
      'LB',
      marks
        .filter(
          (mark) =>
            mark.kind === 'label' &&
            mark.label !== undefined,
        )
        .map(
          (mark) =>
            `${escapeComposedPart(pointToSgf(mark.point))}:${escapeComposedPart(mark.label ?? '')}`,
        ),
    ),
  );

  return `;${properties.join('')}`;
}

function serializeSequence(
  node: StudyNode,
  metadata?: StudyDocument['metadata'],
): string {
  let output = nodeProperties(node, metadata);

  if (node.children.length === 1) {
    output += serializeSequence(
      node.children[0],
    );
  } else if (node.children.length > 1) {
    output += node.children
      .map(
        (child) =>
          `(${serializeSequence(child)})`,
      )
      .join('');
  }

  return output;
}

export function serializeSgf(
  document: StudyDocument,
): string {
  const metadata = {
    ...document.metadata,
    gameName:
      document.metadata.gameName ??
      document.title,
  };

  return `(${serializeSequence(
    document.root,
    metadata,
  )})`;
}
