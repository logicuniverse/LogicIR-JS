import {
  composeChildren,
  createDirectComponentContext,
  createReactiveProperty,
  htmlElement,
  rawContent,
} from './runtime';
import type { ComponentFunction, ComponentText, RuntimeValue } from './types';

export const titleProperty = createReactiveProperty<ComponentText>('hello');
export const eventLog: RuntimeValue[] = [];

export const rawTitle = (): ComponentFunction => rawContent(titleProperty);

export const panel = (): ComponentFunction => {
  const context = createDirectComponentContext();
  const first = rawTitle();
  const second = rawContent(createReactiveProperty<ComponentText>('world'));
  const children = composeChildren([
    first(context)({}),
    second(context)({}),
  ]);

  return htmlElement({
    tag: 'div',
    props: {
      class: 'panel',
      onClick: (value) => eventLog.push(value),
    },
    children: [children(context)({})],
  });
};
