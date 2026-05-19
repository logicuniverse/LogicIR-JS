import type { CoreOnlyExample } from '../../index.js';
import { createExampleHarness } from '../../runtime/harness.js';
import {
  multiLuiCompositionFixture,
  multiLuiCompositionInputs,
} from './fixture.js';

export const multiLuiCompositionExample: CoreOnlyExample = {
  key: '05-multi-lui-composition',
  title: 'Multi-LUI Composition',
  purpose:
    'Prove multiple combinational LUIs can compose through explicit result-to-input connections under one core scope.',
  logicUnit: multiLuiCompositionFixture,
  run: () => {
    const harness = createExampleHarness(multiLuiCompositionFixture);
    harness.setInputCurrent('left', multiLuiCompositionInputs.left);
    harness.setInputCurrent('right', multiLuiCompositionInputs.right);

    const result = harness.readResult();
    const connectionCount = Object.keys(
      multiLuiCompositionFixture.core.connections,
    ).length;

    return {
      key: '05-multi-lui-composition',
      ok: result === 18 && connectionCount === 4,
      summary: `result=${result}, connections=${connectionCount}`,
    };
  },
};
