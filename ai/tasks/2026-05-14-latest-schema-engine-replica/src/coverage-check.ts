import { legacyCoverageRows } from './legacy-coverage';

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

console.log(
  JSON.stringify(
    {
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
