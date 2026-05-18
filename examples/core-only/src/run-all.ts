import { runExamples } from './index.js';

const results = runExamples();

for (const result of results) {
  const status = result.ok ? 'ok' : 'fail';
  console.log(`${status} ${result.key}: ${result.summary}`);
}

const failed = results.filter((result) => !result.ok);

if (failed.length > 0) {
  throw new Error(`${failed.length} core-only example(s) failed`);
} else {
  console.log(`core-only examples passed: ${results.length}`);
}
