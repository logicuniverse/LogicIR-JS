import type { CoreOnlyExample } from '../../index.js';
import { createExampleHarness } from '../../runtime/harness.js';
import {
  requirementClosureFixture,
  requirementClosureInput,
} from './fixture.js';

export const requirementClosureExample: CoreOnlyExample = {
  key: '06-z-requirement-closure',
  title: 'Z Requirement + Closure',
  purpose:
    'Prove requirement-target LUIs can be fulfilled either by a local closure or by an upstream supplier, without collapsing Z into ordinary dataflow.',
  logicUnit: requirementClosureFixture,
  run: () => {
    const harness = createExampleHarness(requirementClosureFixture);
    harness.setInputValue('value', requirementClosureInput);

    const result = harness.readResult() as
      | { closure?: number; upstream?: number }
      | undefined;

    const closureFulfillment =
      requirementClosureFixture.core.luis.closureIncrement.fulfillments.math;
    const upstreamFulfillment =
      requirementClosureFixture.core.luis.upstreamIncrement.fulfillments.math;

    const closureOk =
      closureFulfillment.kind === 'independent-units' &&
      closureFulfillment.units.increment.kind === 'closure' &&
      result?.closure === 11;

    const upstreamOk =
      upstreamFulfillment.kind === 'independent-units' &&
      upstreamFulfillment.units.increment.kind === 'upstream-unit' &&
      result?.upstream === 11;

    return {
      key: '06-z-requirement-closure',
      ok: closureOk && upstreamOk,
      summary: `closure=${result?.closure}, upstream=${result?.upstream}`,
    };
  },
};
