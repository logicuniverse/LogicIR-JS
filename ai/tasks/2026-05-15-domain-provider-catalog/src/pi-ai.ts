import type {
  PiAiCompletionInputs,
  PiAiProviderBinding,
  PiAiProviderConfig,
  StreamEvent,
  ToolCallEvent,
} from './types';

export const createMockPiAiProvider = (
  config: PiAiProviderConfig,
): PiAiProviderBinding => {
  const providerLabel = `${config.provider}/${config.modelId}`;
  return {
    complete: async (inputs) => {
      const prompt = normalizePrompt(inputs);
      return `mock:${providerLabel}:${prompt}`;
    },
    stream: async function* (inputs): AsyncIterable<StreamEvent> {
      const prompt = normalizePrompt(inputs);
      yield {
        type: 'delta',
        content: `mock:${providerLabel}:`,
      };
      yield {
        type: 'delta',
        content: prompt,
      };
      yield {
        type: 'toolCall',
        toolCall: createToolCall(prompt),
      };
      yield {
        type: 'done',
        content: `mock:${providerLabel}:${prompt}`,
      };
    },
  };
};

export const collectStream = async (
  stream: AsyncIterable<StreamEvent>,
): Promise<{ events: StreamEvent[]; toolCalls: ToolCallEvent[] }> => {
  const events: StreamEvent[] = [];
  const toolCalls: ToolCallEvent[] = [];
  for await (const event of stream) {
    events.push(event);
    if (event.toolCall) {
      toolCalls.push(event.toolCall);
    }
  }
  return { events, toolCalls };
};

const normalizePrompt = (inputs: PiAiCompletionInputs): string => {
  const system = inputs.systemPrompt ? `[${inputs.systemPrompt}]` : '';
  const messages = inputs.messages
    .map((message) => `${message.role}:${message.content}`)
    .join('|');
  return `${system}${messages}`;
};

const createToolCall = (prompt: string): ToolCallEvent => ({
  name: 'record_prompt',
  arguments: {
    length: prompt.length,
    preview: prompt.slice(0, 16),
  },
});
