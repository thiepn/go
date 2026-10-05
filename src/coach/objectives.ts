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
  ladder:
    'When you start a long chase, read the ladder to the edge before playing the first atari.',
  net:
    'Before chasing with another atari, ask whether one surrounding move can remove every useful escape route.',
  snapback:
    'Before taking a tempting single stone, check whether the opponent can immediately recapture a larger group.',
  semeai:
    'When two neighboring groups cannot both escape, count outside liberties for both sides before choosing the first move.',
  'false-eye':
    'Before calling a group alive, inspect each eye point and ask whether the opponent can still cut or capture there.',
  'vital-point':
    'In an enclosed eye space, look for the move that changes the number of eyes before playing ordinary liberties.',
  seki:
    'When both groups seem trapped, check whether playing first would actually remove your own shared liberties.',
  cutting:
    'Before extending or attacking, identify the opponent’s strongest cut and decide whether your groups stay connected after it.',
  shape:
    'When two moves achieve the same goal, prefer the one that creates more liberties and fewer redundant stones.',
  'weak-groups':
    'At each quiet moment, identify your weakest group by eyes, base, liberties, and connection before starting a new fight.',
  'attack-defense':
    'Attack weak stones for profit, not only to kill: strengthen yourself, build territory, or keep initiative while applying pressure.',
  influence:
    'When you have a strong wall, look outward for useful development or attack instead of adding unnecessary stones behind it.',
  invasion:
    'Before invading deeply, identify where your new group can make a base, connect, or run if attacked.',
  reduction:
    'When the opponent’s framework is large but strong, consider shrinking it from the outside instead of forcing a deep life-and-death fight.',
  'sente-gote':
    'Before taking an endgame point, ask whether the opponent must answer; prioritize useful moves that keep the initiative.',
  endgame:
    'Once groups are settled, compare boundary moves by points and urgency before playing the nearest move automatically.',
  opening:
    'In the opening, prefer moves that develop large areas while keeping weak groups and urgent local problems in view.',
  joseki:
    'Treat joseki as a locally balanced tool: before choosing a sequence, ask which resulting direction and outside strength fit the whole board.',
};

export function objectiveForConcept(
  conceptId: string,
): string {
  return (
    OBJECTIVES[conceptId] ??
    'Play one focused game and deliberately check this concept before each important local decision.'
  );
}
