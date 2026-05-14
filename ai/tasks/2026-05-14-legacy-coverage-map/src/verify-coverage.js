const fs = require('fs');
const path = require('path');

const taskRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(taskRoot, '..', '..', '..');
const coveragePath = path.join(taskRoot, 'coverage.json');
const reportPath = path.join(taskRoot, 'coverage-report.md');

const data = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
const allowedStatuses = new Set(data.statusEnum);
const rows = data.coverage;
const errors = [];

if (!Array.isArray(rows) || rows.length === 0) {
  errors.push('coverage must contain at least one row');
}

const ids = new Set();
const requiredStatuses = new Set([
  'covered-by-s1-s5',
  'partially-covered',
  'missing',
  'defer',
  'drop-intentionally',
]);
const seenStatuses = new Set();

for (const row of rows) {
  if (!row.id || typeof row.id !== 'string') {
    errors.push(`row missing id: ${JSON.stringify(row)}`);
    continue;
  }

  if (ids.has(row.id)) {
    errors.push(`duplicate id: ${row.id}`);
  }
  ids.add(row.id);

  if (!allowedStatuses.has(row.status)) {
    errors.push(`${row.id}: invalid status ${row.status}`);
  } else {
    seenStatuses.add(row.status);
  }

  if (!row.category || !row.capability) {
    errors.push(`${row.id}: missing category or capability`);
  }

  if (!Array.isArray(row.sources) || row.sources.length === 0) {
    errors.push(`${row.id}: sources must be non-empty`);
  } else {
    for (const source of row.sources) {
      const sourcePath = path.join(repoRoot, source);
      if (!fs.existsSync(sourcePath)) {
        errors.push(`${row.id}: source does not exist: ${source}`);
      }
    }
  }

  if (
    ['missing', 'partially-covered', 'defer', 'drop-intentionally'].includes(
      row.status,
    ) &&
    (!row.recommendation || row.recommendation.length < 12)
  ) {
    errors.push(`${row.id}: missing actionable recommendation`);
  }

  if (
    row.status === 'covered-by-s1-s5' &&
    (!Array.isArray(row.coveredBy) || row.coveredBy.length === 0)
  ) {
    errors.push(`${row.id}: covered row must list S-round coverage`);
  }
}

for (const status of requiredStatuses) {
  if (!seenStatuses.has(status)) {
    errors.push(`status not represented: ${status}`);
  }
}

if (!fs.existsSync(reportPath)) {
  errors.push('coverage-report.md is missing');
} else {
  const report = fs.readFileSync(reportPath, 'utf8');
  for (const row of rows) {
    if (!report.includes(row.id)) {
      errors.push(`coverage-report.md missing row id: ${row.id}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const byStatus = {};
for (const row of rows) {
  byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
}

console.log(
  JSON.stringify(
    {
      rows: rows.length,
      byStatus,
      report: path.relative(repoRoot, reportPath),
    },
    null,
    2,
  ),
);
