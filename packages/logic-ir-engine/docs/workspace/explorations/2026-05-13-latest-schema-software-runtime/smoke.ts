import { architectureDefinitions } from './architecture/software-runtime-architecture';
import {
  completionToPromise,
  createSoftwareRuntime,
  Ok,
  Some,
} from './runtime/software-runtime';
import {
  addOneUnit,
  exampleProviders,
  sequentialDoubleThenAddUnit,
} from './examples/software-runtime-examples';

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const readNumber = (value: unknown): number => {
  if (
    value &&
    typeof value === 'object' &&
    (value as { kind?: unknown }).kind === 'ok'
  ) {
    const result = value as {
      kind: 'ok';
      value: { kind: 'some'; value: unknown } | { kind: 'nothing' };
    };
    if (result.value.kind === 'some') {
      return Number(result.value.value);
    }
  }
  throw new Error(`Expected numeric ok/some result, got ${JSON.stringify(value)}`);
};

const main = async (): Promise<void> => {
  assert(
    architectureDefinitions.features.length === 1,
    'architecture should declare one software runtime feature'
  );
  assert(
    architectureDefinitions.profiles.length === 3,
    'architecture should declare IR, projection, and execution profiles'
  );

  const runtime = createSoftwareRuntime({ providers: exampleProviders });

  const addResult = await completionToPromise(
    runtime.run(addOneUnit, { input: Ok(Some(41)) })
  );
  assert(readNumber(addResult) === 42, 'add-one example should return 42');

  const sequentialResult = await completionToPromise(
    runtime.run(sequentialDoubleThenAddUnit, { input: Ok(Some(20)) })
  );
  assert(
    readNumber(sequentialResult) === 41,
    'sequential async double then add example should return 41'
  );

  console.log('latest-schema software runtime smoke: ok');
};

void main();

