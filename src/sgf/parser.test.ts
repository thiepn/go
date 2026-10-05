import { describe, expect, it } from 'vitest';

import {
  findStudyPath,
} from '../study/tree';
import { parseSgf, parseSgfCollection } from './parser';

describe('SGF parser', () => {
  it('parses metadata, setup, comments, marks, passes and variations', () => {
    const study = parseSgf(
      '(;FF[4]GM[1]CA[UTF-8]SZ[9]KM[6.5]GN[Test]PB[Black]PW[White]AB[aa][bb]PL[W]C[root\\] note]TR[cc]LB[dd:A];W[ee]C[first](;B[ef]C[var one];W[])(;B[fe]C[var two]))',
    );

    expect(study.metadata.boardSize).toBe(9);
    expect(study.metadata.komi).toBe(6.5);
    expect(study.metadata.blackName).toBe('Black');
    expect(study.root.comment).toBe('root] note');
    expect(study.root.setup?.black).toHaveLength(2);
    expect(study.root.setup?.toPlay).toBe('white');
    expect(study.root.marks).toHaveLength(2);

    const whiteMove = study.root.children[0];
    expect(whiteMove.move).toEqual({
      color: 'white',
      point: { x: 4, y: 4 },
    });
    expect(whiteMove.children).toHaveLength(2);
    expect(whiteMove.children[0].children[0].move?.point).toBeNull();
  });

  it('expands compressed point-list ranges', () => {
    const study = parseSgf(
      '(;FF[4]GM[1]SZ[9]AB[aa:bb]TR[cc:dc])',
    );

    expect(study.root.setup?.black).toHaveLength(4);
    expect(
      study.root.marks?.filter(
        (mark) => mark.kind === 'triangle',
      ),
    ).toHaveLength(2);
  });

  it('parses multiple game trees from one collection', () => {
    const collection = parseSgfCollection(
      '(;FF[4]GM[1]SZ[9]GN[One])(;FF[4]GM[1]SZ[13]GN[Two])',
    );

    expect(collection).toHaveLength(2);
    expect(collection[0].metadata.boardSize).toBe(9);
    expect(collection[1].metadata.boardSize).toBe(13);
  });

  it('creates searchable tree paths', () => {
    const study = parseSgf(
      '(;FF[4]GM[1]SZ[9];B[cc];W[dd])',
    );
    const target =
      study.root.children[0].children[0];

    expect(
      findStudyPath(study.root, target.id),
    ).toHaveLength(3);
  });
});
