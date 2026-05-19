import type { CoreOnlyExample } from '../../index.js';
import { createExampleHarness } from '../../runtime/harness.js';
import {
  closureDirectScopeFixture,
  closureDirectScopeInput,
} from './fixture.js';

export const closureDirectScopeExample: CoreOnlyExample = {
  key: '07-closure-direct-scope',
  title: 'Closure Direct Scope',
  purpose:
    'Prove closure owner endpoints behave as nested core-scope boundary proxies, not just requirement-only special cases.',
  logicUnit: closureDirectScopeFixture,
  run: () => {
    const harness = createExampleHarness(closureDirectScopeFixture);
    harness.setInputCurrent('value', closureDirectScopeInput);

    const result = Number(harness.readResult());
    const runResult = Number(harness.run().initialObservation);

    return {
      key: '07-closure-direct-scope',
      ok: result === 11 && runResult === 11,
      summary: `result=${result}, run=${runResult}`,
    };
  },
};
