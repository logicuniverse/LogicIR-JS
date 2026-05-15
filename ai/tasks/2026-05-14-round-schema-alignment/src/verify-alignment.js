const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');

const taskNames = fs
  .readdirSync(path.join(repoRoot, 'ai', 'tasks'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) =>
    /^2026-05-14-basic-software-interpreter-s[1-5]$/.test(name) ||
    /^2026-05-14-basic-hdl-sim-h[1-5](?:-.+)?$/.test(name),
  )
  .sort();

const forbiddenSchemaTypeDefinitions = [
  'LogicUnit',
  'Port',
  'ExtensionRecord',
  'FeatureUse',
  'Connection',
  'EndpointRef',
  'LUI',
  'LUCore',
  'FeatureDefinition',
  'IRPipelineProfileDefinition',
  'ProjectionProfileDefinition',
  'ExecutionProfileDefinition',
  'StackDefinition',
  'CapabilityDefinition',
  'ProviderContractDefinition',
];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const readText = (filePath) => fs.readFileSync(filePath, 'utf8');
const taskPath = (taskName) => path.join(repoRoot, 'ai', 'tasks', taskName);

const violations = [];
const results = [];

for (const taskName of taskNames) {
  const srcDir = path.join(taskPath(taskName), 'src');
  const typesPath = path.join(srcDir, 'types.ts');
  assert(fs.existsSync(typesPath), `${taskName} is missing src/types.ts`);

  const typeText = readText(typesPath);
  const hasCoreImport =
    typeText.includes("from '@logic-universe/logic-ir-core'") ||
    typeText.includes('from "@logic-universe/logic-ir-core"');
  const hasArchitectureImport =
    typeText.includes("from '@logic-universe/logic-ir-architecture'") ||
    typeText.includes('from "@logic-universe/logic-ir-architecture"');

  for (const typeName of forbiddenSchemaTypeDefinitions) {
    const pattern = new RegExp(`export\\s+type\\s+${typeName}\\b`);
    if (pattern.test(typeText)) {
      violations.push(`${taskName}/src/types.ts redefines ${typeName}`);
    }
  }

  const architecturePath = path.join(srcDir, 'architecture.ts');
  if (fs.existsSync(architecturePath)) {
    assert(
      hasArchitectureImport,
      `${taskName}/src/types.ts must import architecture schema types.`,
    );
  }

  assert(
    hasCoreImport,
    `${taskName}/src/types.ts must import core schema types.`,
  );

  const readme = readText(path.join(taskPath(taskName), 'README.md'));
  const verification = readText(path.join(taskPath(taskName), 'verification.md'));
  assert(
    readme.includes('Current status: `ready-for-review`'),
    `${taskName} is not ready-for-review.`,
  );
  assert(
    readme.includes('## Interpretation Note'),
    `${taskName} README is missing Interpretation Note.`,
  );
  assert(
    verification.includes('`yarn verify`') && verification.includes('passed'),
    `${taskName} verification does not record a passed yarn verify.`,
  );
  const sourceFiles = fs
    .readdirSync(srcDir)
    .filter((fileName) => fileName.endsWith('.ts'))
    .map((fileName) => readText(path.join(srcDir, fileName)))
    .join('\n');
  assert(
    sourceFiles.includes('baselineOnly'),
    `${taskName} source does not declare baseline interpretation metadata.`,
  );

  results.push({ task: taskName, core: hasCoreImport, architecture: hasArchitectureImport });
}

if (violations.length > 0) {
  throw new Error(`Schema type alignment violations:\n${violations.join('\n')}`);
}

console.log(
  JSON.stringify(
    {
      checkedTasks: results.length,
      tasks: results,
    },
    null,
    2,
  ),
);
