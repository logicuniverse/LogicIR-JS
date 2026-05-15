import { legacyStdlibNodeKeys } from './catalog';

declare const require: (id: string) => {
  readFileSync?: (path: string, encoding: string) => string;
  resolve?: (...segments: string[]) => string;
};
declare const process: { cwd: () => string; exit: (code?: number) => never };

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve!(process.cwd(), '..', '..', '..');

const read = (relativePath: string): string =>
  fs.readFileSync!(path.resolve!(repoRoot, relativePath), 'utf8');

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

const objectLiteral = (source: string, name: string): string => {
  const text = stripComments(source);
  const marker = text.indexOf(name);
  if (marker < 0) {
    throw new Error(`Missing object ${name}`);
  }

  const equals = text.indexOf('=', marker);
  const open = text.indexOf('{', equals);
  let depth = 0;
  let quote: string | undefined;

  for (let index = open; index < text.length; index += 1) {
    const ch = text[index];
    const previous = text[index - 1];

    if (quote) {
      if (ch === quote && previous !== '\\') {
        quote = undefined;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    if (depth === 0) {
      return text.slice(open, index + 1);
    }
  }

  throw new Error(`Unclosed object ${name}`);
};

const topLevelKeys = (source: string, name: string): string[] => {
  const objectText = objectLiteral(source, name);
  const keys: string[] = [];
  let depth = 0;
  let quote: string | undefined;

  for (let index = 0; index < objectText.length; index += 1) {
    const ch = objectText[index];
    const previous = objectText[index - 1];

    if (quote) {
      if (ch === quote && previous !== '\\') {
        quote = undefined;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{' || ch === '[' || ch === '(') depth += 1;
    if (ch === '}' || ch === ']' || ch === ')') depth -= 1;

    if (depth === 1) {
      const rest = objectText.slice(index);
      const quoted = rest.match(/^\s*['"]([^'"]+)['"]\s*:/);
      const identifier = rest.match(/^\s*([A-Za-z_$][\w$]*)\s*:/);
      const match = quoted ?? identifier;
      if (match) {
        keys.push(match[1]);
        index += match[0].length;
      }
    }
  }

  return keys;
};

const prefix = (namespace: string, keys: string[]): string[] =>
  keys.map((key) => `${namespace}.${key}`);

const operators = read(
  'packages/legacy/flow-core/src/nodes/stdlib/operators/index.ts',
);
const array = read('packages/legacy/flow-core/src/nodes/stdlib/array/index.ts');
const object = read(
  'packages/legacy/flow-core/src/nodes/stdlib/object/index.ts',
);

const extractedLegacyKeys = [
  ...topLevelKeys(
    read('packages/legacy/flow-core/src/nodes/stdlib/constants/index.ts'),
    'constantNodeTemplates',
  ),
  ...prefix('operator', [
    ...topLevelKeys(operators, 'arithmeticOperations'),
    ...topLevelKeys(operators, 'comparisonOperations'),
    ...topLevelKeys(operators, 'logicalOperations'),
    ...topLevelKeys(operators, 'bitwiseOperations'),
  ]),
  ...prefix(
    'number',
    topLevelKeys(
      read('packages/legacy/flow-core/src/nodes/stdlib/number/index.ts'),
      'numberSimpleNodeTemplates',
    ),
  ),
  ...prefix(
    'string',
    topLevelKeys(
      read('packages/legacy/flow-core/src/nodes/stdlib/string/index.ts'),
      'stringSimpleNodeTemplates',
    ),
  ),
  ...topLevelKeys(array, 'arrayNodeTemplates'),
  ...prefix('array', topLevelKeys(array, 'arraySimpleNodeTemplates')),
  ...topLevelKeys(object, 'objectNodeTemplates'),
  ...prefix('object', topLevelKeys(object, 'objectSimpleNodeTemplates')),
  ...topLevelKeys(
    read('packages/legacy/flow-core/src/nodes/stdlib/async/index.ts'),
    'asyncNodeTemplates',
  ),
  ...topLevelKeys(
    read('packages/legacy/flow-core/src/nodes/stdlib/event/index.ts'),
    'eventNodeTemplates',
  ),
  ...topLevelKeys(
    read('packages/legacy/flow-core/src/nodes/stdlib/state/index.ts'),
    'propertyNodeTemplates',
  ),
  ...topLevelKeys(
    read('packages/legacy/flow-core/src/nodes/stdlib/components/index.ts'),
    'componentNodeTemplates',
  ),
];

const extracted = new Set(extractedLegacyKeys);
const catalog = new Set<string>(legacyStdlibNodeKeys);
const missing = [...extracted].filter((key) => !catalog.has(key));
const extra = [...catalog].filter((key) => !extracted.has(key));

if (
  extractedLegacyKeys.length !== extracted.size ||
  legacyStdlibNodeKeys.length !== catalog.size ||
  missing.length > 0 ||
  extra.length > 0
) {
  console.error(
    JSON.stringify(
      {
        extractedLegacy: extractedLegacyKeys.length,
        uniqueExtractedLegacy: extracted.size,
        catalog: legacyStdlibNodeKeys.length,
        uniqueCatalog: catalog.size,
        missing,
        extra,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      extractedLegacy: extractedLegacyKeys.length,
      uniqueExtractedLegacy: extracted.size,
      catalog: legacyStdlibNodeKeys.length,
      uniqueCatalog: catalog.size,
    },
    null,
    2,
  ),
);
