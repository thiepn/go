import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createGame,
  playMove,
  serializeBoard,
  type GameState,
  type Point,
} from '../go/engine';
import type {
  SavedGameRecord,
} from '../play/types';
import {
  replayStudyPath,
} from '../study/replay';
import type {
  StudyNode,
} from '../study/types';
import {
  parseSgf,
} from './parser';
import {
  savedGameToStudy,
} from './records';
import {
  serializeSgf,
} from './serializer';

function rng(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;

    value = Math.imul(
      value ^ (value >>> 15),
      value | 1,
    );
    value ^= value +
      Math.imul(
        value ^ (value >>> 7),
        value | 61,
      );

    return (
      ((value ^ (value >>> 14)) >>> 0) /
      4294967296
    );
  };
}

function randomGame(
  size: 9 | 13 | 19,
  seed: number,
  plies: number,
): GameState {
  const random = rng(seed);
  let state = createGame({
    size,
  });

  for (
    let ply = 0;
    ply < plies;
    ply += 1
  ) {
    let moved = false;

    for (
      let attempt = 0;
      attempt <
      size * size * 2;
      attempt += 1
    ) {
      const point: Point = {
        x: Math.floor(
          random() * size,
        ),
        y: Math.floor(
          random() * size,
        ),
      };
      const result =
        playMove(
          state,
          point,
        );

      if (result.ok) {
        state = result.state;
        moved = true;
        break;
      }
    }

    if (!moved) break;
  }

  return state;
}

function deepestMainline(
  root: StudyNode,
): StudyNode {
  let node = root;

  while (
    node.children.length > 0
  ) {
    node =
      node.children[0];
  }

  return node;
}

describe('C6 SGF integrity', () => {
  it.each([
    'SZ[1]',
    'SZ[26]',
    'SZ[9.5]',
    'SZ[abc]',
    'SZ[9:13]',
    'SZ[9:9:9]',
  ])(
    'rejects unsupported board geometry %s instead of coercing it',
    (sizeProperty) => {
      expect(() =>
        parseSgf(
          `(;FF[4]GM[1]${sizeProperty})`,
        ),
      ).toThrow();
    },
  );

  it('rejects an explicit non-Go SGF game type', () => {
    expect(() =>
      parseSgf(
        '(;FF[4]GM[2]SZ[9])',
      ),
    ).toThrow(
      /only imports Go/i,
    );
  });

  it('accepts an explicitly square rectangular-size form', () => {
    expect(
      parseSgf(
        '(;FF[4]GM[1]SZ[9:9])',
      ).metadata.boardSize,
    ).toBe(9);
  });

  it('rejects conflicting SGF setup edits instead of silently overwriting stones', () => {
    const study = parseSgf(
      '(;FF[4]GM[1]SZ[9]AB[cc]AW[cc])',
    );

    expect(() =>
      replayStudyPath(
        study,
        study.root.id,
      ),
    ).toThrow(
      /conflicting/i,
    );
  });

  it('round-trips generated legal games through saved record → SGF → parser → engine replay', () => {
    const campaigns = [
      {
        size: 9 as const,
        seeds: 8,
        plies: 55,
      },
      {
        size: 13 as const,
        seeds: 4,
        plies: 65,
      },
      {
        size: 19 as const,
        seeds: 2,
        plies: 70,
      },
    ];

    for (
      const campaign of campaigns
    ) {
      for (
        let seed = 1;
        seed <=
        campaign.seeds;
        seed += 1
      ) {
        const game =
          randomGame(
            campaign.size,
            campaign.size *
              1000 +
              seed,
            campaign.plies,
          );

        const record: SavedGameRecord = {
          id:
            `c6-${campaign.size}-${seed}`,
          playedAt:
            Date.UTC(
              2026,
              9,
              7,
            ) + seed,
          settings: {
            mode: 'local',
            boardSize:
              campaign.size,
            humanColor: 'black',
            botLevel: '25k',
            handicap: 0,
            komi: 6.5,
            assistanceLevel:
              'independent',
            clock: 'untimed',
          },
          moves: game.moves,
          result: {
            type: 'resign',
            winner:
              game.toPlay ===
              'black'
                ? 'white'
                : 'black',
            resignedBy:
              game.toPlay,
          },
          captures: game.captures,
        };

        const study =
          savedGameToStudy(
            record,
          );
        const reparsed =
          parseSgf(
            serializeSgf(study),
          );
        const finalNode =
          deepestMainline(
            reparsed.root,
          );
        const replayed =
          replayStudyPath(
            reparsed,
            finalNode.id,
          );

        expect(
          serializeBoard(
            replayed.board,
          ),
        ).toBe(
          serializeBoard(
            game.board,
          ),
        );
        expect(
          replayed.captures,
        ).toEqual(
          game.captures,
        );
        expect(
          replayed.moves.map(
            (move) => ({
              type: move.type,
              player:
                move.player,
              point:
                move.type ===
                'play'
                  ? move.point
                  : null,
            }),
          ),
        ).toEqual(
          game.moves.map(
            (move) => ({
              type: move.type,
              player:
                move.player,
              point:
                move.type ===
                'play'
                  ? move.point
                  : null,
            }),
          ),
        );
      }
    }
  }, 30_000);
});
