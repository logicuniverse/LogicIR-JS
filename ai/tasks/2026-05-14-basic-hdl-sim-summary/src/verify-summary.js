const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
const taskRoot = path.resolve(__dirname, '..');
const summaryPath = path.join(taskRoot, 'summary.json');
const reportPath = path.join(taskRoot, 'summary-report.md');
const promotionPath = path.join(taskRoot, 'promotion-checklist.md');

const readText = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const summary = JSON.parse(readText(summaryPath));
assert(summary.stack === 'basic-hdl-sim', 'Unexpected stack.');
assert(
  summary.interpretation?.authority === 'review-evidence',
  'summary.interpretation.authority must be review-evidence.',
);
assert(
  summary.interpretation?.baselineOnly === true,
  'summary.interpretation.baselineOnly must be true.',
);
assert(
  String(summary.interpretation?.note ?? '').includes('not final Verilog projector architecture'),
  'summary.interpretation.note must warn that the sandbox is not final Verilog projector architecture.',
);
assert(Array.isArray(summary.rounds), 'summary.rounds must be an array.');
assert(summary.rounds.length === 5, 'Expected exactly H1-H5 rounds.');

const ids = new Set();
const report = readText(reportPath);
assert(fs.existsSync(promotionPath), 'Missing promotion checklist.');

for (const round of summary.rounds) {
  assert(/^H[1-5]$/.test(round.id), `Unexpected round id ${round.id}.`);
  assert(!ids.has(round.id), `Duplicate round id ${round.id}.`);
  ids.add(round.id);

  const roundPath = path.join(repoRoot, round.path);
  assert(fs.existsSync(roundPath), `Missing round path ${round.path}.`);

  const readme = readText(path.join(roundPath, 'README.md'));
  const verification = readText(path.join(roundPath, 'verification.md'));
  const promotion = path.join(roundPath, 'promotion-checklist.md');

  assert(
    readme.includes('Current status: `ready-for-review`'),
    `${round.id} is not ready-for-review.`,
  );
  assert(
    readme.includes('## Interpretation Note'),
    `${round.id} README is missing Interpretation Note.`,
  );
  assert(
    verification.includes('`yarn verify`') && verification.includes('passed'),
    `${round.id} verification does not record a passed yarn verify.`,
  );
  const sourceFiles = ['src/types.ts', 'src/projector.ts', 'src/smoke.ts']
    .map((relative) => path.join(roundPath, relative))
    .filter((filePath) => fs.existsSync(filePath))
    .map(readText)
    .join('\n');
  assert(
    sourceFiles.includes('baselineOnly'),
    `${round.id} source does not declare baseline interpretation metadata.`,
  );
  if (round.requiresIverilog) {
    assert(
      verification.includes('iverilog') || verification.includes(`${round.id}_PASS`),
      `${round.id} should record HDL simulation evidence.`,
    );
  }
  assert(fs.existsSync(promotion), `${round.id} missing promotion checklist.`);
  assert(report.includes(round.id), `summary-report.md does not mention ${round.id}.`);
}

for (const expected of ['H1', 'H2', 'H3', 'H4', 'H5']) {
  assert(ids.has(expected), `Missing ${expected}.`);
}

console.log(
  JSON.stringify(
    {
      stack: summary.stack,
      rounds: [...ids].sort(),
      status: summary.status,
      report: path.relative(repoRoot, reportPath),
    },
    null,
    2,
  ),
);
