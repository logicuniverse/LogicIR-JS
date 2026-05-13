import {
  collectStackFeatures,
  sameFeature,
  validateStackDefinition,
} from './architecture-types';
import { featureCatalog, profiles, stacks } from './stacks';

type Check = {
  name: string;
  pass: boolean;
  detail?: string;
};

const unique = (items: readonly string[]): boolean =>
  new Set(items).size === items.length;

const includesStack = (id: string): boolean =>
  stacks.some((stack) => stack.id === id);

const profileIds = profiles.map((profile) => profile.id);
const stackIds = stacks.map((stack) => stack.id);
const variantIds = stacks.flatMap((stack) =>
  (stack.variants ?? []).map((variant) => variant.id)
);
const validationErrors = stacks.flatMap(validateStackDefinition);
const usedFeatures = stacks.flatMap(collectStackFeatures);
const catalogFeatures = featureCatalog.map((entry) => entry.feature);
const unknownFeatures = usedFeatures.filter(
  (used) => !catalogFeatures.some((entry) => sameFeature(entry, used))
);

const basicSoftware = stacks.find(
  (stack) => stack.id === 'logicir.stack.basic-software'
);
const basicHdl = stacks.find((stack) => stack.id === 'logicir.stack.basic-hdl');
const hdlBuildVariant = basicHdl?.variants?.find(
  (variant) => variant.id === 'logicir.stack.basic-hdl.build'
);
const hdlSimVariant = basicHdl?.variants?.find(
  (variant) => variant.id === 'logicir.stack.basic-hdl.sim'
);

const checks: Check[] = [
  {
    name: 'stack definitions validate',
    pass: validationErrors.length === 0,
    detail: validationErrors.join('\n'),
  },
  {
    name: 'stack ids are unique',
    pass: unique(stackIds),
    detail: stackIds.join(', '),
  },
  {
    name: 'stack variant ids are unique',
    pass: unique(variantIds),
    detail: variantIds.join(', '),
  },
  {
    name: 'profile ids are unique',
    pass: unique(profileIds),
    detail: profileIds.join(', '),
  },
  {
    name: 'basic-software stack is present',
    pass: includesStack('logicir.stack.basic-software'),
  },
  {
    name: 'basic-hdl stack is present',
    pass: includesStack('logicir.stack.basic-hdl'),
  },
  {
    name: 'basic-software has execution profile',
    pass: basicSoftware?.execution?.kind === 'execution',
  },
  {
    name: 'basic-hdl build variant has no execution profile',
    pass: hdlBuildVariant !== undefined && hdlBuildVariant.execution === undefined,
  },
  {
    name: 'basic-hdl sim variant has execution profile',
    pass: hdlSimVariant?.execution?.kind === 'execution',
  },
  {
    name: 'every used feature appears in featureCatalog',
    pass: unknownFeatures.length === 0,
    detail: unknownFeatures
      .map((item) => `${item.namespace}/${item.key}`)
      .join(', '),
  },
];

const failed = checks.filter((check) => !check.pass);

for (const check of checks) {
  const status = check.pass ? 'ok' : 'fail';
  console.log(`${status}: ${check.name}`);
  if (!check.pass && check.detail) {
    console.log(check.detail);
  }
}

if (failed.length > 0) {
  throw new Error(
    `Basic stack exploration smoke check failed: ${failed
      .map((check) => check.name)
      .join(', ')}`
  );
}
