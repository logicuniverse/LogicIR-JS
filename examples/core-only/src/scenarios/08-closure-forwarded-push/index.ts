import type { CoreOnlyExample } from '../../index.js';
import { createExampleHarness } from '../../runtime/harness.js';
import {
  closureForwardedPushFixture,
  closureForwardedPushMessage,
} from './fixture.js';

export const closureForwardedPushExample: CoreOnlyExample = {
  key: '08-closure-forwarded-push',
  title: 'Closure Forwarded Push',
  purpose:
    'Prove forwarded closure push outputs propagate through parent scope, while push outputs are not readable as retained current.',
  logicUnit: closureForwardedPushFixture,
  run: () => {
    const harness = createExampleHarness(closureForwardedPushFixture);
    const notifications: string[] = [];

    harness.subscribeOutput('ack', (value) => {
      notifications.push(String(value));
    });

    const runResult = harness.run();
    runResult.handle?.pushInput('message', closureForwardedPushMessage);

    let readFailed = false;
    try {
      harness.readOutput('ack');
    } catch {
      readFailed = true;
    }

    return {
      key: '08-closure-forwarded-push',
      ok:
        runResult.handle !== undefined &&
        runResult.initialObservation === undefined &&
        notifications.length === 1 &&
        notifications[0] === 'ack:hello' &&
        readFailed,
      summary: `notifications=${notifications.join(' -> ') || 'none'}, readFailed=${readFailed}`,
    };
  },
};
