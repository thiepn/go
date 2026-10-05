import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  buildMasterySnapshot,
} from './model';
import {
  CONCEPTS,
  getConcept,
} from './graph';

describe('developing-player mastery graph', () => {
  it('resolves the full graph without prerequisite cycles', () => {
    const snapshot =
      buildMasterySnapshot([]);

    expect(
      Object.keys(
        snapshot.concepts,
      ),
    ).toHaveLength(
      CONCEPTS.length,
    );
  });

  it('contains the developing concepts with practice mappings', () => {
    for (const id of [
      'ladder',
      'net',
      'snapback',
      'semeai',
      'false-eye',
      'vital-point',
      'seki',
      'cutting',
      'shape',
      'weak-groups',
      'attack-defense',
      'influence',
      'invasion',
      'reduction',
      'sente-gote',
      'endgame',
      'opening',
      'joseki',
    ]) {
      const concept =
        getConcept(id);

      expect(concept).toBeDefined();
      expect(
        concept?.practiceTags
          .length,
      ).toBeGreaterThan(0);
    }
  });

  it('preserves key prerequisite chains', () => {
    expect(
      getConcept('ladder')
        ?.prerequisites,
    ).toContain('reading');

    expect(
      getConcept('weak-groups')
        ?.prerequisites,
    ).toContain('shape');

    expect(
      getConcept('endgame')
        ?.prerequisites,
    ).toContain(
      'sente-gote',
    );

    expect(
      getConcept('joseki')
        ?.prerequisites,
    ).toContain('opening');
  });
});
