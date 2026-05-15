export type NodeKind = 'compute' | 'sequence' | 'stateful' | 'structural';

export type PortShape = {
  key: string;
  discipline: 'data' | 'stream' | 'component';
  destructuring?: 'object' | 'array';
  hidden?: boolean;
};

export type DomainNodeSnapshot = {
  key: string;
  displayName: string;
  kind: NodeKind;
  inputs: PortShape[];
  outputs: PortShape[];
  returns?: PortShape[];
  dependencies?: Record<string, ProviderDependency>;
  defaults?: Record<string, RuntimeValue>;
};

export type ProviderDependency = {
  packageKey: string;
  serviceKey: string;
  methodKey?: string;
  composite?: boolean;
  stateful?: boolean;
};

export type RuntimeValue =
  | null
  | boolean
  | number
  | string
  | RuntimeValue[]
  | { [key: string]: RuntimeValue };

export type CelContext = Record<string, RuntimeValue>;

export type Message = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
};

export type PiAiProviderConfig = {
  provider: string;
  modelId: string;
  apiKey: string;
};

export type ToolCallEvent = {
  name: string;
  arguments: Record<string, RuntimeValue>;
};

export type StreamEvent = {
  type: 'delta' | 'toolCall' | 'done';
  content?: string;
  toolCall?: ToolCallEvent;
};

export type PiAiProviderBinding = {
  complete: (inputs: PiAiCompletionInputs) => Promise<string>;
  stream: (inputs: PiAiCompletionInputs) => AsyncIterable<StreamEvent>;
};

export type PiAiCompletionInputs = {
  messages: Message[];
  systemPrompt?: string;
};

export type HonoRouteNode = {
  kind: 'app' | 'route' | 'get';
  path: string;
  children?: HonoRouteNode[];
  handlerName?: string;
};

export type RouteEntry = {
  method: 'GET';
  path: string;
  handlerName: string;
};

export type SmokeReport = {
  task: 'domain-provider-catalog';
  status: 'passed' | 'failed';
  catalogEntries: number;
  celResult: RuntimeValue;
  completeResult: string;
  streamEvents: number;
  toolCalls: number;
  routes: number;
};
