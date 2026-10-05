import { describe, expect, it } from 'vitest';

import {
  addStudyChild,
  createStudyDocument,
  updateStudyComment,
} from '../study/tree';
import { parseSgf } from './parser';
import { serializeSgf } from './serializer';

describe('SGF serializer', () => {
  it('round-trips moves, branches, comments, setup and marks', () => {
    let study = createStudyDocument({
      title: 'Round trip',
      boardSize: 9,
      komi: 6.5,
      metadata: {
        boardSize: 9,
        komi: 6.5,
        gameName: 'Round trip',
        blackName: 'B',
        whiteName: 'W',
      },
      root: {
        id: 'root',
        setup: {
          black: [{ x: 0, y: 0 }],
          toPlay: 'white',
        },
        comment: 'root ] slash \\',
        marks: [
          {
            point: { x: 1, y: 1 },
            kind: 'triangle',
          },
          {
            point: { x: 2, y: 2 },
            kind: 'label',
            label: 'A:B',
          },
        ],
        children: [],
      },
      now: 10,
    });

    const first = addStudyChild(
      study,
      'root',
      {
        id: 'w1',
        move: {
          color: 'white',
          point: { x: 4, y: 4 },
        },
        children: [],
      },
      10,
    );
    study = first.document;

    study = addStudyChild(
      study,
      'w1',
      {
        id: 'b1',
        move: {
          color: 'black',
          point: { x: 3, y: 4 },
        },
        comment: 'main',
        children: [],
      },
      10,
    ).document;

    study = addStudyChild(
      study,
      'w1',
      {
        id: 'b2',
        move: {
          color: 'black',
          point: { x: 5, y: 4 },
        },
        comment: 'variation',
        children: [],
      },
      10,
    ).document;

    study = updateStudyComment(
      study,
      'w1',
      'branch here',
      10,
    );

    const reparsed = parseSgf(
      serializeSgf(study),
    );

    expect(reparsed.metadata.gameName).toBe('Round trip');
    expect(reparsed.root.setup?.black).toEqual([
      { x: 0, y: 0 },
    ]);
    expect(reparsed.root.comment).toBe('root ] slash \\');
    expect(reparsed.root.marks).toHaveLength(2);
    expect(
      reparsed.root.marks?.find(
        (mark) => mark.kind === 'label',
      )?.label,
    ).toBe('A:B');
    expect(reparsed.title).toBe('Round trip');
    expect(reparsed.root.children[0].comment).toBe('branch here');
    expect(reparsed.root.children[0].children).toHaveLength(2);
    expect(
      reparsed.root.children[0].children.map(
        (node) => node.comment,
      ),
    ).toEqual(['main', 'variation']);
  });
});
