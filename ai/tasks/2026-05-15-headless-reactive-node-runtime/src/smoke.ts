import { counterGraph, muxGraph } from './fixtures';
import { legacyNodeSnapshots } from './legacy-node-snapshot';
import { HeadlessReactiveRuntime } from './runtime';
import type { SmokeReport } from './types';

type SmokeCase = {
  name: string;
  run: () => boolean;
};

const counterRuntime = new HeadlessReactiveRuntime(counterGraph);
counterRuntime.initialize();
counterRuntime.emit('mergedUpdates', 'out', 2);
counterRuntime.emit('mergedUpdates', 'out', 5);
counterRuntime.emit('counter', 'increment', null);
counterRuntime.emit('bonus', 'add', 3);

const counterSnapshot = counterRuntime.snapshot();

const muxRuntime = new HeadlessReactiveRuntime(muxGraph);
muxRuntime.initialize();
muxRuntime.emit('mux', 'out', 'ready');
const muxSnapshot = muxRuntime.snapshot();

const cases: SmokeCase[] = [
  {
    name: 'captures selected legacy node snapshots',
    run: () =>
      legacyNodeSnapshots['property.number'].retainedOutputs?.includes(
        'value',
      ) === true &&
      legacyNodeSnapshots['event.merge'].outputs.includes('out') &&
      legacyNodeSnapshots['operator.add'].operator === 'add',
  },
  {
    name: 'retains current number property state',
    run: () => counterSnapshot.values.counter.value === 8,
  },
  {
    name: 'recomputes derived operator values',
    run: () =>
      counterSnapshot.values.total.value === 21 &&
      counterSnapshot.values.isLarge.value === true,
  },
  {
    name: 'forwards merge stream events into property command port',
    run: () =>
      counterSnapshot.trace.filter((item) => item.kind === 'forward').length >=
      2,
  },
  {
    name: 'supports mux-style headless event forwarding',
    run: () => muxSnapshot.values.sink.output === 'ready',
  },
];

const failures = cases.filter((item) => !item.run());
if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL ${failure.name}`);
  }
  throw new Error(`${failures.length} headless reactive smoke checks failed.`);
}

const report: SmokeReport = {
  task: 'headless-reactive-node-runtime',
  status: 'passed',
  finalCounter: counterSnapshot.values.counter.value,
  finalTotal: counterSnapshot.values.total.value,
  forwardedEvents: counterSnapshot.trace.filter((item) => item.kind === 'forward')
    .length,
  traceLength: counterSnapshot.trace.length + muxSnapshot.trace.length,
};

console.log(JSON.stringify(report, null, 2));
