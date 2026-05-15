import { evaluateCelSubset } from './cel';
import { honoApp, honoGet, honoRoute, materializeRoutes } from './hono';
import { collectStream, createMockPiAiProvider } from './pi-ai';
import type { PiAiCompletionInputs, PiAiProviderConfig } from './types';

export const runCelFixture = () =>
  evaluateCelSubset('a + b', {
    a: 1,
    b: 2,
  });

export const runNestedCelFixture = () =>
  evaluateCelSubset('user.age >= limit', {
    user: {
      age: 20,
    },
    limit: 18,
  });

export const providerConfig: PiAiProviderConfig = {
  provider: 'mock-provider',
  modelId: 'mock-model',
  apiKey: 'task-local-key',
};

export const completionInputs: PiAiCompletionInputs = {
  systemPrompt: 'answer briefly',
  messages: [
    {
      role: 'user',
      content: 'hello',
    },
  ],
};

export const runPiAiFixture = async () => {
  const provider = createMockPiAiProvider(providerConfig);
  const completeResult = await provider.complete(completionInputs);
  const streamResult = await collectStream(provider.stream(completionInputs));
  return {
    completeResult,
    streamResult,
  };
};

export const runHonoFixture = () =>
  materializeRoutes(
    honoApp([
      honoRoute('/api', [
        honoGet('/hello', 'helloHandler'),
      ]),
    ]),
  );
