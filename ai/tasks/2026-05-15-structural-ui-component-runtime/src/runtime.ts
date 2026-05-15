import type {
  ComponentChild,
  ComponentContext,
  ComponentFunction,
  ComponentNode,
  ComponentText,
  EventHandler,
  ReactiveProperty,
  RuntimeValue,
} from './types';

export const createReactiveProperty = <T extends RuntimeValue>(
  initial: T,
): ReactiveProperty<T> => {
  let current = initial;
  const subscribers = new Set<(value: T) => void>();
  return {
    read: () => current,
    update: (value) => {
      current = value;
      for (const subscriber of subscribers) {
        subscriber(value);
      }
    },
    subscribe: (callback) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
  };
};

export const createHeadlessComponentContext = (): ComponentContext => ({
  compose: (node) => normalizeNode(node),
  useProperty: (property) => property.read(),
});

export const rawContent = (
  content: ReactiveProperty<ComponentText>,
): ComponentFunction => (context) => () => context.useProperty(content);

export const htmlElement = (options: {
  tag: string;
  props?: Record<string, RuntimeValue | EventHandler>;
  children?: ComponentChild[] | Record<string, ComponentChild>;
}): ComponentFunction => (context) => () =>
  context.compose({
    kind: 'element',
    item: options.tag,
    props: normalizeProps(options.props ?? {}),
    children: options.children ?? [],
  });

export const composeChildren = (
  children: ComponentChild[] | Record<string, ComponentChild>,
): ComponentFunction => (context) => () =>
  context.compose({
    kind: 'fragment',
    children,
  });

export const renderReactAppHeadless = (
  domNode: string,
  render: ComponentFunction,
): { domNode: string; tree: ComponentChild } => {
  const context = createHeadlessComponentContext();
  return {
    domNode,
    tree: render(context)({}),
  };
};

export const flattenChildren = (child: ComponentChild): ComponentChild[] => {
  if (!isComponentNode(child)) {
    return child === null ? [] : [child];
  }
  const values = Array.isArray(child.children)
    ? child.children
    : Object.values(child.children);
  return values.flatMap(flattenChildren);
};

export const createDirectComponentContext = (): ComponentContext => ({
  compose: (node) => node,
  useProperty: (property) => property.read(),
});

export const triggerEvent = (
  node: ComponentChild,
  eventKey: string,
  value: RuntimeValue,
): boolean => {
  if (!isComponentNode(node)) {
    return false;
  }
  const handler = node.props?.[eventKey];
  if (typeof handler === 'function') {
    handler(value);
    return true;
  }
  return false;
};

const normalizeNode = (node: ComponentNode): ComponentNode | ComponentChild => {
  if (node.kind === 'fragment') {
    const children = Array.isArray(node.children)
      ? node.children.filter((child) => child !== null)
      : Object.values(node.children).filter((child) => child !== null);
    if (children.length === 0) {
      return null;
    }
    if (children.length === 1) {
      return children[0];
    }
    return {
      ...node,
      children,
    };
  }
  return {
    ...node,
    props: normalizeProps(node.props ?? {}),
  };
};

const normalizeProps = (
  props: Record<string, RuntimeValue | EventHandler>,
): Record<string, RuntimeValue | EventHandler> => {
  const normalized = { ...props };
  if ('class' in normalized) {
    normalized.className = normalized.class;
    delete normalized.class;
  }
  return normalized;
};

const isComponentNode = (value: ComponentChild): value is ComponentNode =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  (value.kind === 'element' || value.kind === 'fragment');
