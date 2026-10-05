import type {
  AssistanceLevel,
  AssistanceProfile,
} from './types';

const PROFILES: Readonly<Record<AssistanceLevel, AssistanceProfile>> = {
  demonstrated: {
    level: 'demonstrated',
    proactivePrompt: true,
    showWhatMatters: true,
    showMe: true,
    why: true,
    sequence: true,
    constrainMoves: true,
  },
  guided: {
    level: 'guided',
    proactivePrompt: true,
    showWhatMatters: true,
    showMe: true,
    why: true,
    sequence: true,
    constrainMoves: true,
  },
  assisted: {
    level: 'assisted',
    proactivePrompt: false,
    showWhatMatters: true,
    showMe: true,
    why: true,
    sequence: true,
    constrainMoves: false,
  },
  optional: {
    level: 'optional',
    proactivePrompt: false,
    showWhatMatters: true,
    showMe: true,
    why: true,
    sequence: false,
    constrainMoves: false,
  },
  independent: {
    level: 'independent',
    proactivePrompt: false,
    showWhatMatters: false,
    showMe: false,
    why: false,
    sequence: false,
    constrainMoves: false,
  },
};

export function getAssistanceProfile(
  level: AssistanceLevel,
): AssistanceProfile {
  return PROFILES[level];
}

export function assistanceForGameNumber(
  gameNumber: number,
): AssistanceProfile {
  if (gameNumber <= 1) return PROFILES.guided;
  if (gameNumber === 2) return PROFILES.assisted;
  if (gameNumber === 3) return PROFILES.assisted;
  if (gameNumber === 4) return PROFILES.optional;
  return PROFILES.independent;
}
