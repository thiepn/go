const OBJECTIVES: Readonly<Record<string, string>> = {
  liberties:
    'Before every move, count the liberties of the group you are touching or attacking.',
  groups:
    'Before acting locally, identify which stones are one connected group and which are separate.',
  atari:
    'Before every move, scan the board for groups with exactly one liberty—yours and your opponent’s.',
  capture:
    'Before choosing a move, scan every nearby opponent group for an immediate final-liberty capture.',
  connection:
    'Before playing elsewhere, check whether two nearby groups can be cut apart and whether one move connects them safely.',
  safety:
    'Before every move, scan your own groups first. If any group has one liberty, decide deliberately whether to save, connect, capture, or sacrifice it.',
  territory:
    'Before starting a fight, ask what area you are actually trying to secure and whether the move strengthens that boundary.',
  life:
    'When a group is surrounded, check whether it can make two real eyes before treating it as safe.',
  ko:
    'When a capture can be immediately answered, stop and check whether the position is a ko before planning the recapture.',
  passing:
    'Before passing, scan every unsettled group and open boundary once more.',
  scoring:
    'Near the end, distinguish secure area from unsettled space before deciding the game is finished.',
  reading:
    'Before committing to a tactical move, predict the opponent’s most forcing reply and your answer to it.',
};

export function objectiveForConcept(
  conceptId: string,
): string {
  return (
    OBJECTIVES[conceptId] ??
    'Play one focused game and deliberately check this concept before each important local decision.'
  );
}
