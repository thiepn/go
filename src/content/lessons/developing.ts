import type { LessonDefinition } from '../../learning/runtime';

export const readingDepthLesson: LessonDefinition = {
  id: 'develop-reading-depth',
  title: 'Read before you touch the board',
  concept: 'reading',
  initialBoard: {
    size: 5,
    black: [
      { x: 1, y: 2 },
      { x: 2, y: 1 },
    ],
    white: [{ x: 2, y: 2 }],
  },
  steps: [
    {
      id: 'forcing-first',
      kind: 'continue',
      title: 'Start with forcing moves.',
      instruction:
        'Reading means imagining likely replies before you play. Begin with forcing moves such as atari, capture, cut, or a move that must be answered.',
      enterEffects: [
        {
          type: 'show-liberties',
          of: { x: 2, y: 2 },
        },
      ],
    },
    {
      id: 'find-candidates',
      kind: 'select-points',
      title: 'Find the forcing candidates.',
      instruction:
        'White has two liberties. Tap both moves that would put White in atari.',
      expectedPoints: [
        { x: 3, y: 2 },
        { x: 2, y: 3 },
      ],
      successText:
        'Good. Reading begins by narrowing the position to meaningful candidate moves.',
    },
    {
      id: 'read-reply',
      kind: 'choose-answer',
      title: 'Do not stop at your move.',
      instruction:
        'After choosing a forcing move, what should you imagine next?',
      choices: [
        {
          id: 'reply',
          label: 'The opponent’s strongest reply and my answer to it',
        },
        {
          id: 'hope',
          label: 'Only the result I want',
        },
        {
          id: 'random',
          label: 'Every legal move on the board equally',
        },
      ],
      correctChoiceId: 'reply',
      successText:
        'Exactly. Good reading follows the strongest plausible reply, not the line you hope the opponent chooses.',
    },
  ],
};

export const ladderLesson: LessonDefinition = {
  id: 'develop-ladder',
  title: 'Ladders: read the zigzag first',
  concept: 'ladder',
  prerequisiteConcepts: ['reading'],
  initialBoard: {
    size: 7,
    black: [
      { x: 1, y: 2 },
      { x: 2, y: 1 },
    ],
    white: [{ x: 2, y: 2 }],
  },
  steps: [
    {
      id: 'ladder-start',
      kind: 'predict-move',
      title: 'Start the chase.',
      instruction:
        'Black can atari White toward the open board. Tap the forcing move on White’s right.',
      acceptedPoints: [{ x: 3, y: 2 }],
      enterEffects: [
        {
          type: 'marker',
          marker: {
            point: { x: 3, y: 2 },
            label: '1',
            tone: 'accent',
          },
        },
      ],
      successText:
        'That begins the repeated atari pattern. Now read the escape-and-atari rhythm before committing.',
    },
    {
      id: 'ladder-sequence',
      kind: 'predict-sequence',
      title: 'Follow the zigzag.',
      instruction:
        'Tap this short ladder fragment in alternating move order: Black atari, White escape, Black atari, White escape.',
      expectedSequence: [
        { x: 3, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 2, y: 4 },
      ],
      successText:
        'That diagonal repetition is the ladder pattern. A real ladder must be read all the way to the edge or a ladder breaker.',
    },
    {
      id: 'ladder-breaker',
      kind: 'choose-answer',
      title: 'A distant stone can change everything.',
      instruction:
        'Why must you inspect the ladder path before starting the chase?',
      choices: [
        {
          id: 'breaker',
          label: 'A distant opposing stone can interfere with the ladder and let the chased group escape',
        },
        {
          id: 'always',
          label: 'Ladders always work once the first atari is possible',
        },
        {
          id: 'score',
          label: 'Because ladders only matter during scoring',
        },
      ],
      correctChoiceId: 'breaker',
      successText:
        'Correct. Read the entire path first. Starting a failing ladder can damage your position severely.',
    },
  ],
};

export const netLesson: LessonDefinition = {
  id: 'develop-net',
  title: 'Nets: surround the escape',
  concept: 'net',
  prerequisiteConcepts: ['reading'],
  initialBoard: {
    size: 7,
    black: [
      { x: 2, y: 3 },
      { x: 3, y: 2 },
    ],
    white: [{ x: 3, y: 3 }],
  },
  steps: [
    {
      id: 'chase-or-net',
      kind: 'choose-answer',
      title: 'Not every capture needs another atari.',
      instruction:
        'If a direct chase lets the target keep running, what is a net trying to do instead?',
      choices: [
        {
          id: 'routes',
          label: 'Cover the important escape routes before the stone reaches them',
        },
        {
          id: 'atari',
          label: 'Give atari every move no matter where the target runs',
        },
        {
          id: 'ignore',
          label: 'Ignore the target completely',
        },
      ],
      correctChoiceId: 'routes',
      successText:
        'Exactly. A net wins by shape and future coverage, not by immediate contact.',
    },
    {
      id: 'net-point',
      kind: 'predict-move',
      title: 'Cast the net.',
      instruction:
        'Tap the diagonal point that begins surrounding White’s open escape routes rather than touching the stone directly.',
      acceptedPoints: [{ x: 4, y: 4 }],
      enterEffects: [
        {
          type: 'highlight',
          points: [{ x: 4, y: 4 }],
          kind: 'focus',
          pulse: true,
        },
      ],
      successText:
        'That is the net idea: stay far enough away to remove several future escapes at once.',
    },
    {
      id: 'net-reading',
      kind: 'choose-answer',
      title: 'Nets still require reading.',
      instruction:
        'What must you verify before declaring the net successful?',
      choices: [
        {
          id: 'escape',
          label: 'That every reasonable escape route still runs into surrounding stones',
        },
        {
          id: 'touch',
          label: 'That every black stone touches the target immediately',
        },
        {
          id: 'corner',
          label: 'That the fight is in a corner',
        },
      ],
      correctChoiceId: 'escape',
      successText:
        'Correct. A net is not magic; you still read whether the target can break through.',
    },
  ],
};

export const snapbackLesson: LessonDefinition = {
  id: 'develop-snapback',
  title: 'Snapback: the capture that loses',
  concept: 'snapback',
  prerequisiteConcepts: ['reading'],
  initialBoard: {
    size: 5,
    black: [
      { x: 1, y: 1 },
      { x: 2, y: 0 },
      { x: 3, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 4 },
      { x: 3, y: 3 },
    ],
    white: [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
    ],
  },
  steps: [
    {
      id: 'tempting-capture',
      kind: 'continue',
      title: 'A capture can be bait.',
      instruction:
        'Snapback positions punish automatic capturing. One side offers a stone so the capturing group is left with only one liberty.',
      enterEffects: [
        {
          type: 'show-atari',
          groupAt: { x: 2, y: 2 },
        },
      ],
    },
    {
      id: 'snapback-question',
      kind: 'choose-answer',
      title: 'Look one move beyond the capture.',
      instruction:
        'Before taking a tempting stone in a crowded shape, what should you check?',
      choices: [
        {
          id: 'recapture',
          label: 'Whether the opponent can immediately recapture a larger group',
        },
        {
          id: 'free',
          label: 'Whether every capture is automatically good',
        },
        {
          id: 'komi',
          label: 'Whether komi changes the legality of the capture',
        },
      ],
      correctChoiceId: 'recapture',
      successText:
        'Correct. Snapback is a reading tactic: the first capture is only the setup for the larger recapture.',
    },
    {
      id: 'snapback-vital',
      kind: 'predict-move',
      title: 'Find the recapture point.',
      instruction:
        'Tap the central point where a snapback recapture would occur after the bait is taken.',
      acceptedPoints: [{ x: 2, y: 2 }],
      enterEffects: [
        {
          type: 'marker',
          marker: {
            point: { x: 2, y: 2 },
            label: '!',
            tone: 'warning',
          },
        },
      ],
      successText:
        'That point is the tactical heart of the shape. Always read one capture beyond the obvious one.',
    },
  ],
};

export const capturingRaceLesson: LessonDefinition = {
  id: 'develop-capturing-race',
  title: 'Capturing races: count before you fight',
  concept: 'semeai',
  prerequisiteConcepts: ['reading'],
  initialBoard: {
    size: 5,
    black: [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    white: [
      { x: 3, y: 1 },
      { x: 3, y: 2 },
    ],
  },
  steps: [
    {
      id: 'count-black',
      kind: 'select-points',
      title: 'Count Black’s outside liberties.',
      instruction:
        'Tap the empty intersections directly beside the black group that are not occupied by White.',
      expectedPoints: [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 0 },
        { x: 1, y: 3 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
      ],
      successText:
        'Good. In a capturing race, accurate liberty counting comes before tactical confidence.',
    },
    {
      id: 'race-principle',
      kind: 'choose-answer',
      title: 'Do not count only your target.',
      instruction:
        'What decides a basic capturing race most directly?',
      choices: [
        {
          id: 'both',
          label: 'The liberties and forcing moves available to both groups',
        },
        {
          id: 'stones',
          label: 'Whichever group contains more stones',
        },
        {
          id: 'first',
          label: 'Whoever started the fight',
        },
      ],
      correctChoiceId: 'both',
      successText:
        'Exactly. Compare both groups, then account for shared liberties, captures, and forcing moves.',
    },
    {
      id: 'shared-liberties',
      kind: 'select-points',
      title: 'Shared liberties matter.',
      instruction:
        'Tap the two points between the groups. These shared liberties behave differently from outside liberties.',
      expectedPoints: [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
      ],
      successText:
        'Correct. Shared liberties are often the reason a capturing race cannot be solved by a simple outside-liberty count.',
    },
  ],
};

export const falseEyeLesson: LessonDefinition = {
  id: 'develop-false-eye',
  title: 'False eyes: empty does not mean alive',
  concept: 'false-eye',
  initialBoard: {
    size: 5,
    black: [
      { x: 2, y: 1 },
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 3 },
    ],
    white: [
      { x: 1, y: 1 },
      { x: 3, y: 3 },
    ],
  },
  steps: [
    {
      id: 'eye-point',
      kind: 'select-points',
      title: 'Find the apparent eye.',
      instruction:
        'Tap the empty point surrounded orthogonally by black stones.',
      expectedPoints: [{ x: 2, y: 2 }],
      successText:
        'It looks like an eye from the four sides. Now inspect the diagonals.',
    },
    {
      id: 'diagonals',
      kind: 'select-stones',
      title: 'The diagonals reveal the weakness.',
      instruction:
        'Tap the two white diagonal stones that undermine this apparent eye.',
      expectedPoints: [
        { x: 1, y: 1 },
        { x: 3, y: 3 },
      ],
      successText:
        'Those diagonals mean the point is not securely owned by one connected black group.',
    },
    {
      id: 'false-eye-rule',
      kind: 'choose-answer',
      title: 'An eye must belong to a living shape.',
      instruction:
        'Why is counting every surrounded empty point as an eye dangerous?',
      choices: [
        {
          id: 'connection',
          label: 'Cuts or controlled diagonals can make the surrounding stones unable to defend the point as one group',
        },
        {
          id: 'empty',
          label: 'Empty points never count as eyes',
        },
        {
          id: 'center',
          label: 'Eyes cannot exist near the center',
        },
      ],
      correctChoiceId: 'connection',
      successText:
        'Correct. Eye status depends on the surrounding group remaining connected and secure.',
    },
  ],
};

export const vitalPointLesson: LessonDefinition = {
  id: 'develop-life-death-vital-point',
  title: 'Life & death: find the vital point',
  concept: 'vital-point',
  prerequisiteConcepts: ['false-eye'],
  initialBoard: {
    size: 5,
    black: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 0, y: 2 },
      { x: 4, y: 2 },
    ],
  },
  steps: [
    {
      id: 'eye-space',
      kind: 'select-points',
      title: 'See the whole eye space.',
      instruction:
        'Tap the three empty points inside the black enclosure.',
      expectedPoints: [
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
      ],
      successText:
        'This is one connected eye space. Its shape—not just its size—decides life and death.',
    },
    {
      id: 'vital-center',
      kind: 'predict-move',
      title: 'Find the shape-changing move.',
      instruction:
        'Tap the center point. In many compact eye spaces, the vital point is the move that changes how many separate eyes can form.',
      acceptedPoints: [{ x: 2, y: 2 }],
      enterEffects: [
        {
          type: 'highlight',
          points: [{ x: 2, y: 2 }],
          kind: 'warning',
          pulse: true,
        },
      ],
      successText:
        'Exactly. Life-and-death reading often starts by asking: where would my opponent play first?',
    },
    {
      id: 'opponent-best',
      kind: 'choose-answer',
      title: 'Read from the opponent’s best move.',
      instruction:
        'When deciding whether your group lives, which move deserves attention first?',
      choices: [
        {
          id: 'vital',
          label: 'The opponent’s strongest move at the vital point of the eye shape',
        },
        {
          id: 'random',
          label: 'A random outside move',
        },
        {
          id: 'pass',
          label: 'Assume the opponent passes',
        },
      ],
      correctChoiceId: 'vital',
      successText:
        'Correct. Life-and-death skill improves quickly when you habitually search for the opponent’s best vital point.',
    },
  ],
};

export const sekiLesson: LessonDefinition = {
  id: 'develop-seki',
  title: 'Seki: living together because capture fails',
  concept: 'seki',
  prerequisiteConcepts: ['false-eye'],
  initialBoard: {
    size: 5,
    black: [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 0 },
    ],
    white: [
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 2, y: 3 },
    ],
  },
  steps: [
    {
      id: 'shared-space',
      kind: 'select-points',
      title: 'Find the contested liberties.',
      instruction:
        'Tap the two central points both groups depend on.',
      expectedPoints: [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
      ],
      successText:
        'Both groups depend on the same small set of liberties.',
    },
    {
      id: 'why-no-first',
      kind: 'choose-answer',
      title: 'Sometimes the first capture attempt loses.',
      instruction:
        'What is the key idea in a basic seki?',
      choices: [
        {
          id: 'mutual',
          label: 'Neither side can safely fill the shared liberties first without making itself capturable',
        },
        {
          id: 'two-eyes',
          label: 'Both groups always have two normal eyes',
        },
        {
          id: 'ko',
          label: 'Every seki is a ko fight',
        },
      ],
      correctChoiceId: 'mutual',
      successText:
        'Correct. Seki is mutual life created by liberty relationships, not by ordinary two-eye life.',
    },
    {
      id: 'seki-discipline',
      kind: 'continue',
      title: 'Do not “fix” a stable seki automatically.',
      instruction:
        'A move inside shared seki liberties can destroy your own living status. Recognizing that no move is needed is part of good reading.',
    },
  ],
};

export const cuttingLesson: LessonDefinition = {
  id: 'develop-cutting',
  title: 'Cuts: attack the connection point',
  concept: 'cutting',
  initialBoard: {
    size: 5,
    toPlay: 'white',
    black: [
      { x: 1, y: 2 },
      { x: 3, y: 2 },
    ],
  },
  steps: [
    {
      id: 'connection-point',
      kind: 'predict-move',
      title: 'Find the cut.',
      instruction:
        'Black wants to connect through the one-point gap. White can occupy that point first. Tap the cut.',
      acceptedPoints: [{ x: 2, y: 2 }],
      enterEffects: [
        {
          type: 'marker',
          marker: {
            point: { x: 2, y: 2 },
            label: 'cut',
            tone: 'warning',
          },
        },
      ],
      successText:
        'That point separates the two black stones and can create two independent weak groups.',
    },
    {
      id: 'cut-value',
      kind: 'choose-answer',
      title: 'A cut matters because it creates work.',
      instruction:
        'Why is splitting one group into two often powerful?',
      choices: [
        {
          id: 'weakness',
          label: 'Each new group may need its own liberties, eyes, base, or connection',
        },
        {
          id: 'stones',
          label: 'Separated stones become illegal',
        },
        {
          id: 'score',
          label: 'Every cut is automatically worth ten points',
        },
      ],
      correctChoiceId: 'weakness',
      successText:
        'Exactly. The value of a cut comes from the weaknesses and forcing moves it creates.',
    },
    {
      id: 'protect-cut',
      kind: 'choose-answer',
      title: 'Before attacking, check your own cuts.',
      instruction:
        'What should you ask before playing a large move elsewhere?',
      choices: [
        {
          id: 'opponent',
          label: 'Where is my opponent’s strongest cut, and can my groups handle it?',
        },
        {
          id: 'none',
          label: 'Connection points no longer matter after the opening',
        },
        {
          id: 'capture',
          label: 'Only whether I can capture one stone immediately',
        },
      ],
      correctChoiceId: 'opponent',
      successText:
        'Correct. Strong players repeatedly scan their own shape from the opponent’s cutting perspective.',
    },
  ],
};

export const shapeLesson: LessonDefinition = {
  id: 'develop-shape',
  title: 'Shape: make stones do more',
  concept: 'shape',
  prerequisiteConcepts: ['cutting'],
  initialBoard: {
    size: 7,
    black: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
      { x: 4, y: 1 },
      { x: 5, y: 1 },
      { x: 4, y: 2 },
      { x: 5, y: 3 },
    ],
  },
  steps: [
    {
      id: 'empty-triangle',
      kind: 'select-stones',
      title: 'Find the empty triangle.',
      instruction:
        'Tap the three black stones packed into the inefficient L-shape on the left.',
      expectedPoints: [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ],
      successText:
        'That compact shape often duplicates effort: three stones occupy nearby points without creating proportionate liberties or reach.',
    },
    {
      id: 'shape-goal',
      kind: 'choose-answer',
      title: 'Good shape is efficient, not decorative.',
      instruction:
        'What makes a shape useful?',
      choices: [
        {
          id: 'efficient',
          label: 'It connects, creates liberties, and covers useful space without unnecessary stones',
        },
        {
          id: 'pretty',
          label: 'It looks symmetrical',
        },
        {
          id: 'dense',
          label: 'The stones are as close together as possible',
        },
      ],
      correctChoiceId: 'efficient',
      successText:
        'Correct. Shape is a shorthand for how efficiently stones cooperate.',
    },
    {
      id: 'shape-context',
      kind: 'continue',
      title: 'No shape is good in every position.',
      instruction:
        'A shape that is efficient in one fight can be too loose or too heavy in another. Use shape patterns as reading shortcuts, then verify them against cuts and liberties.',
    },
  ],
};

export const weakGroupsLesson: LessonDefinition = {
  id: 'develop-weak-groups',
  title: 'Weak groups decide the middle game',
  concept: 'weak-groups',
  prerequisiteConcepts: ['shape'],
  initialBoard: {
    size: 7,
    black: [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 1 },
      { x: 5, y: 3 },
    ],
    white: [
      { x: 4, y: 3 },
      { x: 5, y: 2 },
    ],
  },
  steps: [
    {
      id: 'identify-weak',
      kind: 'select-group',
      title: 'Find Black’s weaker group.',
      instruction:
        'Tap the isolated black stone near the two white stones. It has less connection, less space, and fewer easy ways to settle.',
      expectedGroup: [{ x: 5, y: 3 }],
      successText:
        'Correct. Weakness is relative: compare eyes, base, liberties, connection, and nearby support.',
    },
    {
      id: 'weak-priority',
      kind: 'choose-answer',
      title: 'A new fight can wait.',
      instruction:
        'If you already have a weak group, what is dangerous about starting another unrelated fight?',
      choices: [
        {
          id: 'burden',
          label: 'You may give the opponent two targets and lose control of the whole board',
        },
        {
          id: 'illegal',
          label: 'The rules forbid two fights at once',
        },
        {
          id: 'always',
          label: 'New fights are always bad',
        },
      ],
      correctChoiceId: 'burden',
      successText:
        'Exactly. Whole-board judgment often starts by asking which existing group cannot afford to be ignored.',
    },
    {
      id: 'strength-use',
      kind: 'choose-answer',
      title: 'Strong and weak groups want different things.',
      instruction:
        'What can a strong group often do that a weak group cannot?',
      choices: [
        {
          id: 'attack',
          label: 'Support attacks or development without needing an immediate defensive move',
        },
        {
          id: 'immortal',
          label: 'Ignore every local threat forever',
        },
        {
          id: 'double',
          label: 'Count twice in scoring',
        },
      ],
      correctChoiceId: 'attack',
      successText:
        'Correct. Strength creates freedom; weakness creates obligations.',
    },
  ],
};

export const attackDefenseLesson: LessonDefinition = {
  id: 'develop-attack-defense',
  title: 'Attack for profit, defend with purpose',
  concept: 'attack-defense',
  prerequisiteConcepts: ['weak-groups'],
  initialBoard: {
    size: 7,
    black: [
      { x: 2, y: 4 },
      { x: 3, y: 4 },
    ],
    white: [
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ],
  },
  steps: [
    {
      id: 'attack-purpose',
      kind: 'choose-answer',
      title: 'Killing is not the only successful attack.',
      instruction:
        'What is a good reason to attack a weak group?',
      choices: [
        {
          id: 'profit',
          label: 'Gain territory, strength, initiative, or useful direction while the group runs',
        },
        {
          id: 'kill',
          label: 'Only killing the entire group counts as success',
        },
        {
          id: 'contact',
          label: 'Always play directly next to the weak stones',
        },
      ],
      correctChoiceId: 'profit',
      successText:
        'Correct. Many excellent attacks never kill; they force the opponent to answer while you improve your position.',
    },
    {
      id: 'defend-efficiently',
      kind: 'choose-answer',
      title: 'Defense should solve a real problem.',
      instruction:
        'Which defensive move is usually preferable?',
      choices: [
        {
          id: 'multi',
          label: 'A move that protects the weakness while also making shape, territory, or connection',
        },
        {
          id: 'extra',
          label: 'Adding stones behind an already safe group',
        },
        {
          id: 'passive',
          label: 'The smallest move that changes nothing else',
        },
      ],
      correctChoiceId: 'multi',
      successText:
        'Exactly. Efficient defense removes weakness while accomplishing something else.',
    },
    {
      id: 'attack-direction',
      kind: 'continue',
      title: 'Attack toward your strength.',
      instruction:
        'When possible, push a weak group toward your strong stones or away from the area your opponent wants to develop. Direction matters as much as pressure.',
    },
  ],
};

export const influenceLesson: LessonDefinition = {
  id: 'develop-influence',
  title: 'Influence: strong stones affect distant play',
  concept: 'influence',
  initialBoard: {
    size: 9,
    black: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 2, y: 4 },
      { x: 2, y: 5 },
      { x: 2, y: 6 },
    ],
  },
  steps: [
    {
      id: 'wall-side',
      kind: 'choose-answer',
      title: 'A wall looks outward.',
      instruction:
        'Where is the useful value of this strong black wall?',
      choices: [
        {
          id: 'outside',
          label: 'In the open area it faces, where it can support development and attacks',
        },
        {
          id: 'behind',
          label: 'Only in adding more stones directly behind it',
        },
        {
          id: 'points',
          label: 'Each wall stone is guaranteed territory by itself',
        },
      ],
      correctChoiceId: 'outside',
      successText:
        'Correct. Influence is potential power over nearby open space and fights, not guaranteed territory.',
    },
    {
      id: 'use-wall',
      kind: 'predict-move',
      title: 'Develop from strength.',
      instruction:
        'Tap a point in the open area in front of the wall, using its strength rather than overconcentrating behind it.',
      acceptedPoints: [
        { x: 5, y: 4 },
        { x: 5, y: 5 },
      ],
      successText:
        'Good. Strong stones let you play farther away because nearby fights favor you.',
    },
    {
      id: 'influence-territory',
      kind: 'choose-answer',
      title: 'Influence is not territory yet.',
      instruction:
        'Why should you avoid counting a large open framework as secure points too early?',
      choices: [
        {
          id: 'contest',
          label: 'The opponent may invade or reduce it before the boundaries are settled',
        },
        {
          id: 'never',
          label: 'Open frameworks can never become territory',
        },
        {
          id: 'komi',
          label: 'Komi cancels all influence',
        },
      ],
      correctChoiceId: 'contest',
      successText:
        'Exactly. Influence is potential; territory is secured space.',
    },
  ],
};

export const invasionLesson: LessonDefinition = {
  id: 'develop-invasion',
  title: 'Invasions: live inside the framework',
  concept: 'invasion',
  initialBoard: {
    size: 9,
    toPlay: 'black',
    white: [
      { x: 6, y: 1 },
      { x: 8, y: 3 },
      { x: 6, y: 5 },
      { x: 8, y: 6 },
    ],
  },
  steps: [
    {
      id: 'invasion-purpose',
      kind: 'choose-answer',
      title: 'An invasion accepts a fight.',
      instruction:
        'What makes an invasion different from a light reduction?',
      choices: [
        {
          id: 'life',
          label: 'An invasion enters deeply enough that the new group must make life, connect, or escape',
        },
        {
          id: 'edge',
          label: 'An invasion must always start on the first line',
        },
        {
          id: 'capture',
          label: 'An invasion must immediately capture stones',
        },
      ],
      correctChoiceId: 'life',
      successText:
        'Correct. Deep entry can destroy more territory, but it creates a new group that must survive.',
    },
    {
      id: 'invasion-point',
      kind: 'predict-move',
      title: 'Enter the framework.',
      instruction:
        'Tap the deeper point inside White’s loose right-side framework.',
      acceptedPoints: [{ x: 7, y: 3 }],
      enterEffects: [
        {
          type: 'highlight',
          points: [{ x: 7, y: 3 }],
          kind: 'warning',
          pulse: true,
        },
      ],
      successText:
        'That is invasion depth: ambitious enough to live inside, but risky if White’s surrounding stones are too strong.',
    },
    {
      id: 'invasion-checklist',
      kind: 'choose-answer',
      title: 'Do not invade on hope alone.',
      instruction:
        'What should you identify before invading?',
      choices: [
        {
          id: 'exit',
          label: 'A base, connection, escape route, or tactical resource for the new group',
        },
        {
          id: 'empty',
          label: 'Only that the point is empty',
        },
        {
          id: 'score',
          label: 'The exact final score of the game',
        },
      ],
      correctChoiceId: 'exit',
      successText:
        'Exactly. An invasion is a life-and-death commitment, not merely a territorial claim.',
    },
  ],
};

export const reductionLesson: LessonDefinition = {
  id: 'develop-reduction',
  title: 'Reductions: shrink without living inside',
  concept: 'reduction',
  prerequisiteConcepts: ['influence'],
  initialBoard: {
    size: 9,
    toPlay: 'black',
    white: [
      { x: 6, y: 1 },
      { x: 8, y: 3 },
      { x: 6, y: 5 },
      { x: 8, y: 6 },
    ],
  },
  steps: [
    {
      id: 'reduction-purpose',
      kind: 'choose-answer',
      title: 'Reduce from the outside.',
      instruction:
        'When is a reduction attractive compared with an invasion?',
      choices: [
        {
          id: 'strong',
          label: 'When the opponent is strong enough that a deep new group would be difficult to live with',
        },
        {
          id: 'always',
          label: 'A reduction is always larger than an invasion',
        },
        {
          id: 'capture',
          label: 'Only when there is an immediate capture',
        },
      ],
      correctChoiceId: 'strong',
      successText:
        'Correct. Reduction trades some territorial damage for lower risk.',
    },
    {
      id: 'reduction-point',
      kind: 'predict-move',
      title: 'Press from the boundary.',
      instruction:
        'Tap the shallower point on the outside edge of White’s framework.',
      acceptedPoints: [{ x: 5, y: 3 }],
      successText:
        'That is the reduction idea: limit the framework while staying connected to the rest of the board.',
    },
    {
      id: 'compare-depth',
      kind: 'choose-answer',
      title: 'Depth changes responsibility.',
      instruction:
        'What new responsibility comes with moving from reduction depth to invasion depth?',
      choices: [
        {
          id: 'survive',
          label: 'The invading stones need an independent way to live or escape',
        },
        {
          id: 'none',
          label: 'There is no strategic difference',
        },
        {
          id: 'pass',
          label: 'You must pass on the next move',
        },
      ],
      correctChoiceId: 'survive',
      successText:
        'Exactly. The deeper you enter, the more territory you can destroy—and the more life-and-death risk you accept.',
    },
  ],
};

export const senteGoteLesson: LessonDefinition = {
  id: 'develop-sente-gote',
  title: 'Sente and gote: who gets the next big move?',
  concept: 'sente-gote',
  initialBoard: {
    size: 7,
    black: [
      { x: 1, y: 5 },
      { x: 2, y: 5 },
      { x: 3, y: 5 },
    ],
    white: [
      { x: 1, y: 6 },
      { x: 2, y: 6 },
      { x: 3, y: 6 },
    ],
  },
  steps: [
    {
      id: 'sente-definition',
      kind: 'choose-answer',
      title: 'Sente keeps the initiative.',
      instruction:
        'What makes an endgame move sente?',
      choices: [
        {
          id: 'answer',
          label: 'It creates a threat important enough that the opponent usually answers',
        },
        {
          id: 'points',
          label: 'It is always the largest move on the board',
        },
        {
          id: 'black',
          label: 'Only Black can have sente',
        },
      ],
      correctChoiceId: 'answer',
      successText:
        'Correct. If the opponent must answer, you often get to move elsewhere again.',
    },
    {
      id: 'gote-definition',
      kind: 'choose-answer',
      title: 'Gote hands over the turn.',
      instruction:
        'What is the cost of a useful but gote move?',
      choices: [
        {
          id: 'initiative',
          label: 'After the local exchange, the opponent is free to take the next big point elsewhere',
        },
        {
          id: 'illegal',
          label: 'Gote moves are illegal',
        },
        {
          id: 'zero',
          label: 'Gote moves are worth zero points',
        },
      ],
      correctChoiceId: 'initiative',
      successText:
        'Exactly. Endgame judgment compares not only points, but who controls the next move.',
    },
    {
      id: 'forcing-edge',
      kind: 'predict-move',
      title: 'Find the forcing edge move.',
      instruction:
        'Tap the outside extension that pushes against White’s boundary and is most likely to demand an answer.',
      acceptedPoints: [{ x: 4, y: 5 }],
      successText:
        'That is the kind of boundary move you should test for sente value before taking a quiet gote point.',
    },
  ],
};

export const endgameLesson: LessonDefinition = {
  id: 'develop-endgame',
  title: 'Endgame: count what is left',
  concept: 'endgame',
  prerequisiteConcepts: ['sente-gote'],
  initialBoard: {
    size: 7,
    black: [
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
    ],
    white: [
      { x: 0, y: 6 },
      { x: 1, y: 6 },
      { x: 2, y: 6 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
    ],
  },
  steps: [
    {
      id: 'endgame-stage',
      kind: 'choose-answer',
      title: 'The endgame starts when big fights settle.',
      instruction:
        'What changes in your decision process during endgame?',
      choices: [
        {
          id: 'compare',
          label: 'You compare remaining boundary moves by points, urgency, and sente instead of starting unnecessary new fights',
        },
        {
          id: 'random',
          label: 'Any legal move is equally good',
        },
        {
          id: 'capture',
          label: 'Only captures matter',
        },
      ],
      correctChoiceId: 'compare',
      successText:
        'Correct. Endgame skill is disciplined comparison of what remains.',
    },
    {
      id: 'big-boundary',
      kind: 'predict-move',
      title: 'Take the larger boundary move.',
      instruction:
        'Tap the lower-left boundary point that extends Black while reducing White along the edge.',
      acceptedPoints: [{ x: 3, y: 5 }],
      enterEffects: [
        {
          type: 'marker',
          marker: {
            point: { x: 3, y: 5 },
            label: 'A',
            tone: 'accent',
          },
        },
        {
          type: 'marker',
          marker: {
            point: { x: 5, y: 2 },
            label: 'B',
            tone: 'neutral',
          },
        },
      ],
      successText:
        'Good. Endgame is full of moves that do two jobs at once: enlarge your area and reduce the opponent’s.',
    },
    {
      id: 'endgame-habit',
      kind: 'choose-answer',
      title: 'Count before playing the nearest move.',
      instruction:
        'What is the best habit once several endgame points remain?',
      choices: [
        {
          id: 'rank',
          label: 'Estimate their value and whether each is sente, then play the best combination',
        },
        {
          id: 'nearest',
          label: 'Always play the move closest to the last move',
        },
        {
          id: 'fill',
          label: 'Fill your own secure territory first',
        },
      ],
      correctChoiceId: 'rank',
      successText:
        'Exactly. A few points saved repeatedly in endgame can decide close games.',
    },
  ],
};

export const openingLesson: LessonDefinition = {
  id: 'develop-opening',
  title: 'Opening principles: develop the board efficiently',
  concept: 'opening',
  initialBoard: {
    size: 9,
    toPlay: 'black',
  },
  steps: [
    {
      id: 'corner-efficiency',
      kind: 'choose-answer',
      title: 'Corners are efficient territory.',
      instruction:
        'Why do opening moves often begin around corners before the center?',
      choices: [
        {
          id: 'edges',
          label: 'The board edges already form two sides of a boundary, so fewer stones are needed to make territory',
        },
        {
          id: 'rule',
          label: 'The rules require the first move in a corner',
        },
        {
          id: 'capture',
          label: 'Corner moves immediately capture stones',
        },
      ],
      correctChoiceId: 'edges',
      successText:
        'Correct. Corners are efficient, sides come next, and the center usually needs the most stones to surround territory.',
    },
    {
      id: 'large-opening',
      kind: 'predict-move',
      title: 'Choose a broad opening point.',
      instruction:
        'On this empty 9×9 board, tap any one of the four balanced near-corner development points.',
      acceptedPoints: [
        { x: 2, y: 2 },
        { x: 6, y: 2 },
        { x: 2, y: 6 },
        { x: 6, y: 6 },
      ],
      successText:
        'Good. The exact best opening move depends on the board, but efficient corner development is a reliable starting principle.',
    },
    {
      id: 'opening-priority',
      kind: 'choose-answer',
      title: 'Urgent before merely large.',
      instruction:
        'If one of your groups is suddenly weak during the opening, what happens to broad opening priorities?',
      choices: [
        {
          id: 'urgent',
          label: 'An urgent move that saves or settles the weak group can become more important than a large empty-board point',
        },
        {
          id: 'ignore',
          label: 'Opening principles mean weak groups should always be ignored',
        },
        {
          id: 'center',
          label: 'You must immediately play the center',
        },
      ],
      correctChoiceId: 'urgent',
      successText:
        'Exactly. Opening principles organize judgment; they do not replace reading the actual position.',
    },
  ],
};

export const josekiLesson: LessonDefinition = {
  id: 'develop-joseki',
  title: 'Joseki: learn purposes, not passwords',
  concept: 'joseki',
  prerequisiteConcepts: ['opening'],
  initialBoard: {
    size: 9,
    black: [{ x: 2, y: 2 }],
    white: [{ x: 4, y: 2 }],
  },
  steps: [
    {
      id: 'joseki-definition',
      kind: 'choose-answer',
      title: 'Joseki is local balance.',
      instruction:
        'What does a joseki sequence try to describe?',
      choices: [
        {
          id: 'local',
          label: 'A locally reasonable exchange where both sides receive compensation',
        },
        {
          id: 'win',
          label: 'A memorized sequence that guarantees the game result',
        },
        {
          id: 'forced',
          label: 'A sequence the rules force both players to follow',
        },
      ],
      correctChoiceId: 'local',
      successText:
        'Correct. Joseki is a local reference, not a commandment.',
    },
    {
      id: 'whole-board',
      kind: 'choose-answer',
      title: 'The whole board can make a joseki choice wrong.',
      instruction:
        'Why can two locally reasonable joseki choices differ in value?',
      choices: [
        {
          id: 'direction',
          label: 'They produce different outside strength, territory, sente, and direction relative to the rest of the board',
        },
        {
          id: 'color',
          label: 'One color is always stronger',
        },
        {
          id: 'memory',
          label: 'The longer sequence is always better',
        },
      ],
      correctChoiceId: 'direction',
      successText:
        'Exactly. Learn what each move is trying to accomplish, then choose sequences that fit the whole board.',
    },
    {
      id: 'joseki-study',
      kind: 'continue',
      title: 'Use joseki as a vocabulary.',
      instruction:
        'At this level, study a few common corner patterns only after you understand cuts, shape, strength, and direction. If you forget a sequence, those principles can still guide you.',
    },
  ],
};
