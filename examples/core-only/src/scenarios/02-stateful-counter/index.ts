import type { StatefulLUCore } from '@logic-universe/logic-ir-core';
import type { CoreOnlyExample } from '../../index.js';
import { createExampleHarness } from '../../runtime/harness.js';
import {
  statefulCounterFixture,
  statefulCounterProgram,
} from './fixture.js';

export const statefulCounterExample: CoreOnlyExample = {
  key: '02-stateful-counter',
  title: 'Stateful Counter',
  purpose:
    'Prove the minimal feature-free stateful current pattern: one pull initial input, push updates, and one property output.',
  logicUnit: statefulCounterFixture,
  run: () => {
    const harness = createExampleHarness(statefulCounterFixture);
    const notifications: number[] = [];

    harness.subscribeOutput('current', (value) => {
      notifications.push(Number(value));
    });
    harness.setInputCurrent('initial', statefulCounterProgram.initial);

    for (const step of statefulCounterProgram.increments) {
      harness.pushInput('increment', step);
    }

    harness.pushInput('reset', statefulCounterProgram.resetValue);

    for (const step of statefulCounterProgram.moreIncrements) {
      harness.pushInput('increment', step);
    }

    if (statefulCounterFixture.core.kindOrganization.kind !== 'stateful') {
      return {
        key: '02-stateful-counter',
        ok: false,
        summary: 'fixture core kind is not stateful',
      };
    }

    const statefulCore = statefulCounterFixture.core as StatefulLUCore;
    const inputContacts = statefulCore.ports.inputs;
    const outputContacts = statefulCore.ports.outputs;
    const current = Number(harness.readOutput('current'));

    const hasExpectedSurface =
      inputContacts.initial.contact === 'pull' &&
      inputContacts.increment.contact === 'push' &&
      inputContacts.reset.contact === 'push' &&
      outputContacts.current.contact === 'property';

    return {
      key: '02-stateful-counter',
      ok: current === 7 && hasExpectedSurface && notifications.length === 7,
      summary: `current=${current}, notifications=${notifications.join(' -> ')}`,
    };
  },
};
