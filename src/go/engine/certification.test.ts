import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createEmptyBoard,
  createGame,
  getGroup,
  getIntersection,
  indexToPoint,
  pass,
  playMove,
  scoreArea,
  serializeBoard,
  setIntersection,
  type Board,
  type GameState,
  type Point,
  type Stone,
} from '.';

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

function stoneCount(
  board: Board,
): number {
  return board.intersections.filter(
    (value) => value !== null,
  ).length;
}

function assertAllGroupsHaveLiberties(
  state: GameState,
): void {
  const seen = new Set<string>();

  for (
    let index = 0;
    index < state.board.intersections.length;
    index += 1
  ) {
    const point = indexToPoint(
      state.board,
      index,
    );
    const stone = getIntersection(
      state.board,
      point,
    );

    if (!stone) continue;

    const key = `${point.x},${point.y}`;
    if (seen.has(key)) continue;

    const group = getGroup(
      state.board,
      point,
    );

    expect(group).not.toBeNull();
    expect(
      group?.liberties.length,
    ).toBeGreaterThan(0);

    for (const member of group?.stones ?? []) {
      seen.add(
        `${member.x},${member.y}`,
      );
    }
  }
}

function assertGameInvariants(
  state: GameState,
  initialStoneCount = 0,
): void {
  expect(
    state.board.intersections,
  ).toHaveLength(
    state.board.size *
      state.board.size,
  );

  expect(
    state.boardHistory,
  ).toHaveLength(
    state.moves.length + 1,
  );

  expect(
    state.boardHistory.at(-1),
  ).toBe(
    serializeBoard(state.board),
  );

  const played = state.moves.filter(
    (move) => move.type === 'play',
  );
  const capturedByMoves = played.reduce(
    (total, move) =>
      total + move.captured.length,
    0,
  );
  const capturedByState =
    state.captures.black +
    state.captures.white;

  expect(capturedByState).toBe(
    capturedByMoves,
  );
  expect(
    stoneCount(state.board),
  ).toBe(
    initialStoneCount +
      played.length -
      capturedByState,
  );

  const blackCaptures = played
    .filter(
      (move) =>
        move.player === 'black',
    )
    .reduce(
      (total, move) =>
        total +
        move.captured.length,
      0,
    );
  const whiteCaptures = played
    .filter(
      (move) =>
        move.player === 'white',
    )
    .reduce(
      (total, move) =>
        total +
        move.captured.length,
      0,
    );

  expect(state.captures).toEqual({
    black: blackCaptures,
    white: whiteCaptures,
  });

  expect(state.toPlay).toBe(
    state.moves.length % 2 === 0
      ? 'black'
      : 'white',
  );

  assertAllGroupsHaveLiberties(
    state,
  );

  if (
    state.rules.koRule ===
      'positional-superko' &&
    state.moves.at(-1)?.type ===
      'play'
  ) {
    const last =
      state.boardHistory.at(-1);

    expect(
      state.boardHistory
        .slice(0, -1)
        .includes(last ?? ''),
    ).toBe(false);
  }
}

function randomLegalGame(
  size: number,
  seed: number,
  maxPlies: number,
): GameState {
  const random = rng(seed);
  let state = createGame({
    size,
    rules: {
      koRule:
        'positional-superko',
      komi: 6.5,
    },
  });

  assertGameInvariants(state);

  for (
    let ply = 0;
    ply < maxPlies &&
    state.status === 'playing';
    ply += 1
  ) {
    let legal:
      | ReturnType<
          typeof playMove
        >
      | null = null;

    const attempts =
      size * size * 2;

    for (
      let attempt = 0;
      attempt < attempts;
      attempt += 1
    ) {
      const point = {
        x: Math.floor(
          random() * size,
        ),
        y: Math.floor(
          random() * size,
        ),
      };
      const before = state;
      const result = playMove(
        state,
        point,
      );

      if (!result.ok) {
        expect(
          result.state,
        ).toBe(before);
        continue;
      }

      legal = result;
      break;
    }

    if (!legal) {
      for (
        let index = 0;
        index < size * size;
        index += 1
      ) {
        const result = playMove(
          state,
          indexToPoint(
            state.board,
            index,
          ),
        );

        if (result.ok) {
          legal = result;
          break;
        }

        expect(result.state).toBe(
          state,
        );
      }
    }

    if (!legal || !legal.ok) {
      const passed = pass(state);

      expect(passed.ok).toBe(
        true,
      );

      if (!passed.ok) {
        throw new Error(
          'Expected pass to remain legal.',
        );
      }

      state = passed.state;
    } else {
      state = legal.state;
    }

    assertGameInvariants(
      state,
    );
  }

  if (state.status === 'playing') {
    const first = pass(state);

    expect(first.ok).toBe(true);
    if (!first.ok) {
      throw new Error(
        'Expected first ending pass.',
      );
    }

    state = first.state;
    assertGameInvariants(state);

    const second = pass(state);

    expect(second.ok).toBe(true);
    if (!second.ok) {
      throw new Error(
        'Expected second ending pass.',
      );
    }

    state = second.state;
    assertGameInvariants(state);
  }

  expect(state.status).toBe(
    'finished',
  );
  expect(
    state.moves.slice(-2).every(
      (move) =>
        move.type === 'pass',
    ),
  ).toBe(true);

  const postGameMove =
    playMove(
      state,
      { x: 0, y: 0 },
    );

  expect(postGameMove).toEqual({
    ok: false,
    state,
    reason: 'game-over',
  });

  const postGamePass =
    pass(state);

  expect(postGamePass).toEqual({
    ok: false,
    state,
    reason: 'game-over',
  });

  return state;
}

function invertBoard(
  board: Board,
): Board {
  let next =
    createEmptyBoard(
      board.size,
    );

  for (
    let index = 0;
    index <
    board.intersections.length;
    index += 1
  ) {
    const stone =
      board.intersections[
        index
      ];

    if (!stone) continue;

    next = setIntersection(
      next,
      indexToPoint(
        board,
        index,
      ),
      stone === 'black'
        ? 'white'
        : 'black',
    );
  }

  return next;
}

describe('C6 game integrity', () => {
  it('preserves engine invariants across deterministic randomized legal games', () => {
    const campaigns = [
      {
        size: 5,
        seeds: 12,
        plies: 70,
      },
      {
        size: 9,
        seeds: 8,
        plies: 100,
      },
      {
        size: 13,
        seeds: 4,
        plies: 120,
      },
      {
        size: 19,
        seeds: 2,
        plies: 140,
      },
    ] as const;

    for (
      const campaign of campaigns
    ) {
      for (
        let seed = 1;
        seed <=
        campaign.seeds;
        seed += 1
      ) {
        randomLegalGame(
          campaign.size,
          seed *
            7919 +
            campaign.size,
          campaign.plies,
        );
      }
    }
  }, 30_000);

  it('captures multiple disconnected adjacent groups simultaneously', () => {
    const game = createGame({
      size: 5,
      setup: {
        black: [
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 0, y: 2 },
          { x: 1, y: 3 },
        ],
        white: [
          { x: 2, y: 1 },
          { x: 1, y: 2 },
        ],
      },
    });

    const result = playMove(
      game,
      { x: 2, y: 2 },
    );

    expect(result.ok).toBe(
      true,
    );

    if (!result.ok) {
      return;
    }

    expect(
      result.move.captured,
    ).toHaveLength(2);
    expect(
      getIntersection(
        result.state.board,
        { x: 2, y: 1 },
      ),
    ).toBeNull();
    expect(
      getIntersection(
        result.state.board,
        { x: 1, y: 2 },
      ),
    ).toBeNull();
    expect(
      result.state.captures.black,
    ).toBe(2);
  });

  it('allows simple-ko recapture after intervening plays', () => {
    let state = createGame({
      size: 5,
      setup: {
        black: [
          { x: 1, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 3 },
        ],
        white: [
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 2, y: 2 },
        ],
      },
    });

    const capture = playMove(
      state,
      { x: 2, y: 1 },
    );
    expect(capture.ok).toBe(
      true,
    );
    if (!capture.ok) return;
    state = capture.state;

    const immediate =
      playMove(
        state,
        { x: 2, y: 2 },
      );
    expect(immediate.ok).toBe(
      false,
    );
    if (!immediate.ok) {
      expect(
        immediate.reason,
      ).toBe('ko');
    }

    const threat = playMove(
      state,
      { x: 4, y: 4 },
    );
    expect(threat.ok).toBe(
      true,
    );
    if (!threat.ok) return;

    const answer = playMove(
      threat.state,
      { x: 4, y: 3 },
    );
    expect(answer.ok).toBe(
      true,
    );
    if (!answer.ok) return;

    const recapture =
      playMove(
        answer.state,
        { x: 2, y: 2 },
      );

    expect(recapture.ok).toBe(
      true,
    );
  });

  it('distinguishes positional superko from immediate simple ko history', () => {
    const empty = createGame({
      size: 3,
    });
    const hypothetical =
      playMove(
        empty,
        { x: 0, y: 0 },
      );

    expect(
      hypothetical.ok,
    ).toBe(true);
    if (!hypothetical.ok) {
      return;
    }

    const repeatedHash =
      serializeBoard(
        hypothetical.state.board,
      );
    const currentHash =
      serializeBoard(
        empty.board,
      );
    const unrelated =
      serializeBoard(
        setIntersection(
          empty.board,
          { x: 2, y: 2 },
          'white',
        ),
      );

    const positional: GameState = {
      ...empty,
      rules: {
        ...empty.rules,
        koRule:
          'positional-superko',
      },
      boardHistory: [
        repeatedHash,
        unrelated,
        currentHash,
      ],
    };

    const positionalResult =
      playMove(
        positional,
        { x: 0, y: 0 },
      );

    expect(
      positionalResult.ok,
    ).toBe(false);
    if (!positionalResult.ok) {
      expect(
        positionalResult.reason,
      ).toBe('ko');
    }

    const simple: GameState = {
      ...positional,
      rules: {
        ...positional.rules,
        koRule: 'simple',
      },
    };

    expect(
      playMove(
        simple,
        { x: 0, y: 0 },
      ).ok,
    ).toBe(true);
  });

  it('partitions every intersection exactly once during randomized area scoring', () => {
    for (
      const size of [5, 9, 13]
    ) {
      for (
        let seed = 1;
        seed <= 20;
        seed += 1
      ) {
        const random = rng(
          size * 1000 + seed,
        );
        let board =
          createEmptyBoard(size);

        for (
          let index = 0;
          index < size * size;
          index += 1
        ) {
          const roll = random();
          const stone: Stone | null =
            roll < 0.3
              ? 'black'
              : roll < 0.6
                ? 'white'
                : null;

          if (stone) {
            board = setIntersection(
              board,
              indexToPoint(
                board,
                index,
              ),
              stone,
            );
          }
        }

        const score =
          scoreArea(
            board,
            0,
          );

        expect(
          score.stones.black +
            score.stones.white +
            score.territory.black +
            score.territory.white +
            score.neutral,
        ).toBe(size * size);

        expect(
          score.total.black,
        ).toBe(
          score.stones.black +
            score.territory.black,
        );
        expect(
          score.total.white,
        ).toBe(
          score.stones.white +
            score.territory.white,
        );

        const inverted =
          scoreArea(
            invertBoard(board),
            0,
          );

        expect(
          inverted.total.black,
        ).toBe(
          score.total.white,
        );
        expect(
          inverted.total.white,
        ).toBe(
          score.total.black,
        );
      }
    }
  });
});
