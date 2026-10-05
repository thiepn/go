import { describe, expect, it } from 'vitest';

import {
  assistanceForGameNumber,
  getAssistanceProfile,
} from './assistance';

describe('guided assistance fade', () => {
  it('keeps the first game fully guided and constrained', () => {
    const profile = assistanceForGameNumber(1);

    expect(profile.level).toBe('guided');
    expect(profile.constrainMoves).toBe(true);
    expect(profile.showWhatMatters).toBe(true);
    expect(profile.showMe).toBe(true);
    expect(profile.why).toBe(true);
    expect(profile.sequence).toBe(true);
  });

  it('removes proactive structure as games progress', () => {
    expect(assistanceForGameNumber(2).level).toBe('assisted');
    expect(assistanceForGameNumber(4).level).toBe('optional');
    expect(assistanceForGameNumber(5).level).toBe('independent');
    expect(getAssistanceProfile('independent').constrainMoves).toBe(false);
    expect(getAssistanceProfile('independent').showMe).toBe(false);
  });
});
