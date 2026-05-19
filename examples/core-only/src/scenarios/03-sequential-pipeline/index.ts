import type { SequentialLUCore } from '@logic-universe/logic-ir-core';
import type { CoreOnlyExample } from '../../index.js';
import { createExampleHarness } from '../../runtime/harness.js';
import {
  sequentialPipelineFixture,
  sequentialPipelineInput,
} from './fixture.js';

export const sequentialPipelineExample: CoreOnlyExample = {
  key: '03-sequential-pipeline',
  title: 'Sequential Pipeline',
  purpose:
    'Prove the minimal feature-free sequential shape: explicit ordered steps, no async semantics in core, and one pull result.',
  logicUnit: sequentialPipelineFixture,
  run: () => {
    if (sequentialPipelineFixture.core.kindOrganization.kind !== 'sequential') {
      return {
        key: '03-sequential-pipeline',
        ok: false,
        summary: 'fixture core kind is not sequential',
      };
    }

    const harness = createExampleHarness(sequentialPipelineFixture);
    const sequentialCore = sequentialPipelineFixture.core as SequentialLUCore;
    harness.setInputCurrent('value', sequentialPipelineInput);
    const current = harness.run().initialObservation;
    const trace = sequentialCore.kindOrganization.steps.map((step) => step.luiId);

    const hasOnlyResultPull =
      sequentialCore.ports.result?.contact === 'pull' &&
      Object.keys(sequentialCore.ports.outputs).length === 0;

    return {
      key: '03-sequential-pipeline',
      ok:
        current === 8 &&
        hasOnlyResultPull &&
        trace.join(' -> ') === 'increment -> double',
      summary: `result=${current}, trace=${trace.join(' -> ')}`,
    };
  },
};
