import { legacyCoverageRows } from './legacy-coverage';
import { baselineInterpretation } from './types';

const requiredStatuses = new Set([
  'covered',
  'partial',
  'defer',
  'drop-intentionally',
]);

const requiredCapabilities = [
  'provider invocation',
  'state store retained-current',
  'thenable completion',
  'closure fulfillment',
  'upstream fulfillment',
  'sequential await',
  'go-back-if',
  'return-if',
  'payload path',
  'plugin hooks',
  'structural composition',
  'diagnostics',
];

for (const row of legacyCoverageRows) {
  if (!requiredStatuses.has(row.status)) {
    throw new Error(`Invalid coverage status for ${row.capability}`);
  }

  if (row.latestSchemaMapping.length === 0) {
    throw new Error(`Coverage row ${row.capability} is missing mapping.`);
  }
}

for (const capability of requiredCapabilities) {
  if (!legacyCoverageRows.some((row) => row.capability === capability)) {
    throw new Error(`Missing coverage row: ${capability}`);
  }
}

const interpretation = baselineInterpretation('latest-schema-legacy-coverage-audit', [
  'Coverage rows compare legacy capabilities against latest-schema replica evidence.',
  'Coverage status is review evidence and must not be promoted as schema authority by itself.',
]);

if (!interpretation.baselineOnly) {
  throw new Error('Coverage audit must declare baseline interpretation metadata.');
}

console.log(
  JSON.stringify(
    {
      interpretation,
      rows: legacyCoverageRows.length,
      covered: legacyCoverageRows.filter((row) => row.status === 'covered')
        .length,
      partial: legacyCoverageRows.filter((row) => row.status === 'partial')
        .length,
    },
    null,
    2,
  ),
);
