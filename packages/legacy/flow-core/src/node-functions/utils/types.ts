import { ComponentContext } from 'ff-runtime-core';

export type ReactiveComponentContext<
  FC = unknown,
  EL = unknown,
> = ComponentContext<FC, EL> & {
  // render: (
  //   type: string | ((...args: any[]) => T | null),
  //   props: Record<string, unknown> | null,
  //   ...children: any[]
  // ) => U;
  useProperty: (
    subscribe: (callback: (data: unknown) => void) => () => void,
    getSnapshot: () => unknown
  ) => unknown;
};
