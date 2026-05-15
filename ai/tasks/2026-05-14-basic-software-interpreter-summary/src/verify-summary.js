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
assert(summary.stack === 'basic-software-interpreter', 'Unexpected stack.');
assert(Array.isArray(summary.rounds), 'summary.rounds must be an array.');
assert(summary.rounds.length === 5, 'Expected exactly S1-S5 rounds.');

const ids = new Set();
const report = readText(reportPath);
assert(fs.existsSync(promotionPath), 'Missing promotion checklist.');

for (const round of summary.rounds) {
  assert(/^S[1-5]$/.test(round.id), `Unexpected round id ${round.id}.`);
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
    verification.includes('`yarn verify`') && verification.includes('passed'),
    `${round.id} verification does not record a passed yarn verify.`,
  );
  assert(fs.existsSync(promotion), `${round.id} missing promotion checklist.`);
  assert(report.includes(round.id), `summary-report.md does not mention ${round.id}.`);
}

for (const expected of ['S1', 'S2', 'S3', 'S4', 'S5']) {
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
