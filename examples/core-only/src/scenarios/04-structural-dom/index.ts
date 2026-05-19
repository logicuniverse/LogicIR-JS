import type { StructuralLUCore } from '@logic-universe/logic-ir-core';
import type { CoreOnlyExample } from '../../index.js';
import { createExampleHarness } from '../../runtime/harness.js';
import {
  structuralDomFixture,
  structuralDomProgram,
} from './fixture.js';

export const structuralDomExample: CoreOnlyExample = {
  key: '04-structural-dom',
  title: 'Structural DOM',
  purpose:
    'Prove a headless structural UI/DOM shape: outlet source to anchor destination, plus property input as a structural prop.',
  logicUnit: structuralDomFixture,
  run: () => {
    if (structuralDomFixture.core.kindOrganization.kind !== 'structural') {
      return {
        key: '04-structural-dom',
        ok: false,
        summary: 'fixture core kind is not structural',
      };
    }

    const structuralCore = structuralDomFixture.core as StructuralLUCore;
    const rootFill = structuralCore.kindOrganization.anchorFills.root;
    const layoutFills = structuralCore.kindOrganization.luiFills.layout;
    const harness = createExampleHarness(structuralDomFixture);

    harness.setInputCurrent('theme', structuralDomProgram.theme);
    harness.applyOutlets({
      header: structuralDomProgram.outlets.header,
      body: structuralDomProgram.outlets.body,
    });

    const projectedTree = harness.readAnchor('root') as
      | {
          type: string;
          theme: string;
          slots: typeof structuralDomProgram.outlets;
        }
      | undefined;

    const isRootFilledFromChildOutlet =
      rootFill.kind === 'lui-outlet' &&
      rootFill.luiId === 'layout' &&
      rootFill.outletKey === 'root';

    const isChildAnchoredFromParentOutlets =
      layoutFills.header.kind === 'outlet' &&
      layoutFills.header.outletKey === 'header' &&
      layoutFills.body.kind === 'outlet' &&
      layoutFills.body.outletKey === 'body';

    const usesPropertyInput =
      structuralCore.ports.inputs.theme.contact === 'property' &&
      structuralCore.luis.layout.ports.inputs.theme.contact === 'property';

    return {
      key: '04-structural-dom',
      ok:
        isRootFilledFromChildOutlet &&
        isChildAnchoredFromParentOutlets &&
        usesPropertyInput &&
        projectedTree?.slots.body.kind === 'list' &&
        projectedTree.slots.body.items.length === 3,
      summary: `theme=${projectedTree?.theme}, header=${projectedTree?.slots.header.kind}, body-items=${projectedTree?.slots.body.kind === 'list' ? projectedTree.slots.body.items.length : 0}`,
    };
  },
};
