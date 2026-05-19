import type { SequentialLUCore } from '@logic-universe/logic-ir-core';
import type { CoreOnlyExample } from '../../index.js';
import { createCoreSoftwareInterpreter } from '@logic-universe/logic-ir-engine-core-software-interpreter';
import { coreOnlyTargetCatalog } from '../../runtime/catalog.js';
import {
  luTargetForwardedPushCatalog,
  luTargetForwardedPushFixture,
  luTargetForwardedPushMessage,
} from './fixture.js';

export const luTargetForwardedPushExample: CoreOnlyExample = {
  key: '09-lu-target-forwarded-push',
  title: 'LU Target Forwarded Push',
  purpose:
    'Prove a target.kind=lu nested scope can forward boundary push outputs back through the outer LUI and root boundary.',
  logicUnit: luTargetForwardedPushFixture,
  run: () => {
    if (luTargetForwardedPushFixture.core.kindOrganization.kind !== 'sequential') {
      return {
        key: '09-lu-target-forwarded-push',
        ok: false,
        summary: 'fixture core kind is not sequential',
      };
    }

    const interpreter = createCoreSoftwareInterpreter({
      logicUnits: luTargetForwardedPushCatalog,
      targets: coreOnlyTargetCatalog,
    });
    const harness = interpreter.manifest(luTargetForwardedPushFixture);
    const notifications: string[] = [];
    const sequentialCore = luTargetForwardedPushFixture.core as SequentialLUCore;

    harness.subscribeOutput('ack', (value) => {
      notifications.push(String(value));
    });
    harness.setInputCurrent('message', luTargetForwardedPushMessage);
    const runResult = harness.run();

    let readFailed = false;
    try {
      harness.readOutput('ack');
    } catch {
      readFailed = true;
    }

    return {
      key: '09-lu-target-forwarded-push',
      ok:
        runResult.initialObservation === undefined &&
        notifications.length === 1 &&
        notifications[0] === 'ack:nested' &&
        readFailed &&
        sequentialCore.kindOrganization.steps[0]?.luiId === 'nestedNotifier',
      summary: `notifications=${notifications.join(' -> ') || 'none'}, readFailed=${readFailed}`,
    };
  },
};
