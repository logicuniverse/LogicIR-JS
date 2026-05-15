export type JsonPrimitive = null | boolean | number | string;
export type RuntimeValue =
  | JsonPrimitive
  | RuntimeValue[]
  | { [key: string]: RuntimeValue };

export type ComponentText = JsonPrimitive;
export type ComponentChild = ComponentNode | ComponentText;

export type ComponentNode = {
  kind: 'element' | 'fragment';
  item?: string;
  props?: Record<string, RuntimeValue | EventHandler>;
  children: ComponentChild[] | Record<string, ComponentChild>;
};

export type EventHandler = (value: RuntimeValue) => void;

export type ReactiveProperty<T = RuntimeValue> = {
  read: () => T;
  update: (value: T) => void;
  subscribe: (callback: (value: T) => void) => () => void;
};

export type ComponentContext = {
  compose: (node: ComponentNode) => ComponentNode | ComponentChild;
  useProperty: <T extends RuntimeValue>(property: ReactiveProperty<T>) => T;
};

export type ComponentFunction = (
  context: ComponentContext,
) => (inputs?: Record<string, RuntimeValue | ComponentChild[]>) => ComponentChild;

export type LegacyUINodeSnapshot = {
  key: string;
  displayName: string;
  kind: 'react-app' | 'html-element' | 'raw-content' | 'component-composer';
  inputs: string[];
  outputs: string[];
  returns?: string[];
  destructuring?: Record<string, 'array' | 'object'>;
};

export type SmokeReport = {
  task: 'structural-ui-component-runtime';
  status: 'passed' | 'failed';
  rootItem: string;
  textBefore: ComponentText;
  textAfter: ComponentText;
  emittedEvents: number;
  childCount: number;
};
