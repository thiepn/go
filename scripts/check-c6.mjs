import {
  existsSync,
  readFileSync,
} from 'node:fs';

const required = [
  'src/go/engine/certification.test.ts',
  'src/sgf/integrity.test.ts',
  'src/play/scoring-certification.test.ts',
  'certification/evidence/C6.md',
  '.github/workflows/c6-rules-integrity.yml',
];

for (const path of required) {
  if (!existsSync(path)) {
    throw new Error(
      `C6 integrity certification is missing ${path}.`,
    );
  }
}

const candidate = JSON.parse(
  readFileSync(
    'certification/release-candidate.json',
    'utf8',
  ),
);

if (
  candidate.phase !== 'C6' ||
  candidate.candidate !==
    '1.0.0-rc.7'
) {
  throw new Error(
    'C6 must certify release candidate 1.0.0-rc.7.',
  );
}

const engineTest = readFileSync(
  'src/go/engine/certification.test.ts',
  'utf8',
);
const sgfTest = readFileSync(
  'src/sgf/integrity.test.ts',
  'utf8',
);
const scoringTest = readFileSync(
  'src/play/scoring-certification.test.ts',
  'utf8',
);
const replay = readFileSync(
  'src/study/replay.ts',
  'utf8',
);
const parser = readFileSync(
  'src/sgf/parser.ts',
  'utf8',
);
const workflow = readFileSync(
  '.github/workflows/c6-rules-integrity.yml',
  'utf8',
);

for (const requiredFragment of [
  'deterministic randomized legal games',
  'positional-superko',
  'simple-ko recapture',
  'partitions every intersection exactly once',
]) {
  if (!engineTest.includes(requiredFragment)) {
    throw new Error(
      `C6 engine campaign is missing: ${requiredFragment}.`,
    );
  }
}

for (const requiredFragment of [
  'rejects unsupported board geometry',
  'rejects an explicit non-Go SGF game type',
  'conflicting SGF setup edits',
  'saved record → SGF → parser → engine replay',
]) {
  if (!sgfTest.includes(requiredFragment)) {
    throw new Error(
      `C6 SGF campaign is missing: ${requiredFragment}.`,
    );
  }
}

if (
  !scoringTest.includes(
    'confirmed dead group',
  ) ||
  !scoringTest.includes(
    'never mutates the original board',
  )
) {
  throw new Error(
    'C6 end-game scoring boundary is incomplete.',
  );
}

if (
  !replay.includes(
    'Study setup contains conflicting',
  )
) {
  throw new Error(
    'C6 must reject conflicting study setup edits.',
  );
}

if (
  !parser.includes(
    'Rectangular SGF boards are not supported',
  ) ||
  !parser.includes(
    'THIEPN Go only imports Go game trees',
  )
) {
  throw new Error(
    'C6 must reject unsupported SGF geometry and game types.',
  );
}

if (
  !workflow.includes(
    'npm ci --no-audit --no-fund',
  ) ||
  !workflow.includes(
    'npm run qa:c6:rules',
  ) ||
  !workflow.includes(
    'npm run check:c6',
  )
) {
  throw new Error(
    'C6 workflow must use the lockfile and run both integrity gates.',
  );
}

console.log(
  'C6 rules/game integrity contract verified for 1.0.0-rc.7.',
);
