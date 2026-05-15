import {
  legacyStdlibNodeKeys,
  stdlibNodeSpecByKey,
  stdlibNodeSpecs,
} from './catalog';
import { stdlibProviders } from './providers';
import { coveredNodeKeys, smokeCases } from './smoke-cases';

const uniqueLegacyKeys = new Set<string>(legacyStdlibNodeKeys);
const catalogKeys = new Set(stdlibNodeSpecs.map((entry) => entry.key));
const providerKeys = new Set<string>(Object.keys(stdlibProviders));
const smokeKeys = new Set<string>(coveredNodeKeys);

const missingCatalog = [...uniqueLegacyKeys].filter((key) => !catalogKeys.has(key));
const extraCatalog = [...catalogKeys].filter((key) => !uniqueLegacyKeys.has(key));
const missingProvider = [...uniqueLegacyKeys].filter(
  (key) => !providerKeys.has(key),
);
const extraProvider = [...providerKeys].filter((key) => !uniqueLegacyKeys.has(key));
const missingSmoke = [...uniqueLegacyKeys].filter((key) => !smokeKeys.has(key));
const extraSmoke = [...smokeKeys].filter((key) => !uniqueLegacyKeys.has(key));
const missingSpecLookup = [...uniqueLegacyKeys].filter(
  (key) => !stdlibNodeSpecByKey.has(key),
);
const duplicateSmoke = smokeCases
  .map((entry) => entry.key)
  .filter((key, index, keys) => keys.indexOf(key) !== index);

if (legacyStdlibNodeKeys.length !== uniqueLegacyKeys.size) {
  throw new Error('legacyStdlibNodeKeys contains duplicates.');
}

if (
  missingCatalog.length > 0 ||
  extraCatalog.length > 0 ||
  missingProvider.length > 0 ||
  extraProvider.length > 0 ||
  missingSmoke.length > 0 ||
  extraSmoke.length > 0 ||
  missingSpecLookup.length > 0 ||
  duplicateSmoke.length > 0
) {
  throw new Error(
    JSON.stringify(
      {
        missingCatalog,
        extraCatalog,
        missingProvider,
        extraProvider,
        missingSmoke,
        extraSmoke,
        missingSpecLookup,
        duplicateSmoke,
      },
      null,
      2,
    ),
  );
}

console.log(
  JSON.stringify(
    {
      legacyKeys: legacyStdlibNodeKeys.length,
      catalog: catalogKeys.size,
      providers: providerKeys.size,
      smokeCases: smokeCases.length,
      smokeCovered: smokeKeys.size,
    },
    null,
    2,
  ),
);
