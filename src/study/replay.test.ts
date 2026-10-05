import { describe, expect, it } from 'vitest';

import {
  getIntersection,
} from '../go/engine';
import { parseSgf } from '../sgf/parser';
import { replayStudyPath } from './replay';

describe('study replay', () => {
  it('replays captures and branches from SGF', () => {
    const study = parseSgf(
      '(;FF[4]GM[1]SZ[5];B[bc];W[cc];B[cb];W[ee];B[dc];W[ed];B[cd])',
    );
    const final =
      study.root.children[0]
        .children[0]
        .children[0]
        .children[0]
        .children[0]
        .children[0]
        .children[0];

    const game = replayStudyPath(
      study,
      final.id,
    );

    expect(
      getIntersection(
        game.board,
        { x: 2, y: 2 },
      ),
    ).toBeNull();
    expect(game.captures.black).toBe(1);
  });

  it('can replay a pass before later study continuation', () => {
    const study = parseSgf(
      '(;FF[4]GM[1]SZ[9];B[cc];W[];B[dd])',
    );
    const final =
      study.root.children[0]
        .children[0]
        .children[0];

    const game = replayStudyPath(
      study,
      final.id,
    );

    expect(game.moves).toHaveLength(3);
    expect(game.status).toBe('playing');
  });
});
