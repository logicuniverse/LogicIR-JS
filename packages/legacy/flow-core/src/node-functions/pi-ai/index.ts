import {
  Service,
  SimpleNodeFunction,
  simpleService2Service,
} from 'ff-runtime-core';

import { getModel, complete, stream } from '@mariozechner/pi-ai';
import { getServiceMethod } from '../utils/method';

const providerNodeFunction: SimpleNodeFunction = ({ inputs, inject }) => {
  const model = getModel(inputs.provider as any, inputs.modelId as any);
  const subflowFn = inject('default', 'context')!;
  const apiKey = inputs.apiKey as any;
  subflowFn({
    inputs: {},
    inject: (serviceKey, methodKey) => {
      if (serviceKey === 'provider') {
        if (methodKey === 'stream') {
          return async ({ inputs, emit }) => {
            const { messages, systemPrompt } = inputs;
            const context = {
              messages,
              tools: [],
              systemPrompt,
            };
            console.log('Starting stream with context', context, model, apiKey);
            const s = stream(model as any, context as any, {
              apiKey: apiKey as any,
            });
            for await (const event of s) {
              emit.data('event', event);
            }
            const result = await s.result();
            return result;
          };
        } else if (methodKey === 'complete') {
          return async ({ inputs }) => {
            const { messages, systemPrompt } = inputs;
            const context = {
              messages,
              tools: [],
              systemPrompt,
            };
            console.log(
              'Starting complete with context',
              context,
              model,
              apiKey
            );
            const response = await complete(model as any, context as any, {
              apiKey: apiKey as any,
            });
            return response.content;
          };
        }
      }
      return null;
    },
    emit: {
      data: () => {},
      error: () => {},
    },
    subscribe: () => {
      return () => {};
    },
  });
};

export const piAiService: Service = simpleService2Service({
  'pi-ai.provider': providerNodeFunction,
  'pi-ai.complete': getServiceMethod('provider', 'complete'),
  'pi-ai.stream': getServiceMethod('provider', 'stream'),
});
