import { legacyDomainNodeSnapshots } from './legacy-domain-snapshot';
import {
  runCelFixture,
  runHonoFixture,
  runNestedCelFixture,
  runPiAiFixture,
} from './fixtures';
import type { SmokeReport } from './types';

const run = async () => {
  const celResult = runCelFixture();
  const nestedCelResult = runNestedCelFixture();
  const piAiResult = await runPiAiFixture();
  const routes = runHonoFixture();
  const catalogEntries = Object.keys(legacyDomainNodeSnapshots).length;

  const checks = [
    catalogEntries === 7,
    legacyDomainNodeSnapshots['cel.cel'].inputs[0].destructuring === 'object',
    legacyDomainNodeSnapshots['pi-ai.provider'].kind === 'stateful',
    legacyDomainNodeSnapshots['pi-ai.complete'].dependencies?.provider
      .methodKey === 'complete',
    legacyDomainNodeSnapshots['pi-ai.stream'].outputs.some(
      (output) => output.key === 'event' && output.discipline === 'stream',
    ),
    legacyDomainNodeSnapshots['hono.route'].kind === 'structural',
    celResult === 3,
    nestedCelResult === true,
    piAiResult.completeResult ===
      'mock:mock-provider/mock-model:[answer briefly]user:hello',
    piAiResult.streamResult.events.length === 4,
    piAiResult.streamResult.toolCalls.length === 1,
    routes.length === 1,
    routes[0].path === '/api/hello',
  ];

  const failed = checks.filter((ok) => !ok).length;
  if (failed > 0) {
    throw new Error(`${failed} domain provider catalog checks failed.`);
  }

  const report: SmokeReport = {
    task: 'domain-provider-catalog',
    status: 'passed',
    catalogEntries,
    celResult,
    completeResult: piAiResult.completeResult,
    streamEvents: piAiResult.streamResult.events.length,
    toolCalls: piAiResult.streamResult.toolCalls.length,
    routes: routes.length,
  };

  console.log(JSON.stringify(report, null, 2));
};

run();
