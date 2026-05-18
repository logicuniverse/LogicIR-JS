import type { CoreOnlyExample } from '../../index.js';
import { createExampleHarness } from '../../runtime/harness.js';
import { combinationalAddFixture, combinationalAddInputs } from './fixture.js';

export const combinationalAddExample: CoreOnlyExample = {
  key: '01-combinational-add',
  title: 'Combinational Add',
  purpose:
    'Prove the minimal feature-free combinational shape: pull inputs, one result, one child LUI result feeding the boundary result.',
  logicUnit: combinationalAddFixture,
  run: () => {
    const harness = createExampleHarness(combinationalAddFixture);
    harness.setInputValue('left', combinationalAddInputs.left);
    harness.setInputValue('right', combinationalAddInputs.right);
    const result = harness.readResult();

    const hasOnlyResultOutput =
      combinationalAddFixture.core.kindOrganization.kind === 'combinational' &&
      !('outputs' in combinationalAddFixture.core.ports);

    return {
      key: '01-combinational-add',
      ok: result === 5 && hasOnlyResultOutput,
      summary: `result=${result}, combinational has outputs=${String(
        'outputs' in combinationalAddFixture.core.ports,
      )}`,
    };
  },
};
