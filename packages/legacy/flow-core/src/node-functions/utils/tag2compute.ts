import { SimpleNodeFunction } from 'ff-runtime-core';
import { ReactiveComponentContext } from './types';

export const tag2compute =
  (tag: string, entry = 'root', propsPortKey = 'props'): SimpleNodeFunction =>
  ({ inputs, emit, subscribe, meta }) => {
    const node = meta!.node;
    const states: Record<string, any> = {
      ...(inputs[propsPortKey] as Record<string, unknown> | undefined),
    };
    const propsPort = node.ports.inputs.find((x) => x.key === propsPortKey);
    const propKeys = propsPort?.destructuringData;
    const eventsPort = node.ports.outputs.find((x) => x.key === 'events');

    if (eventsPort) {
      const eventKeys = eventsPort.destructuringData;
      if (eventKeys && Array.isArray(eventKeys)) {
        eventKeys.forEach((eventName) => {
          states[eventName] = (val: unknown) => {
            emit.data('events', val, [eventName]);
          };
        });
      }
    }
    const emits: Record<string, (val: unknown) => void> = {};
    subscribe({
      data: (key, value, subflowKey, path) => {
        if (key === propsPortKey && path && path.length > 0) {
          states[path[0]] = value;
          emits[path[0]]?.(value);
        } else {
          states[key] = value;
        }
        states[key] = value;
      },
      error: (key, error) => {},
    });
    const getProps = (context: ReactiveComponentContext) => {
      const props: Record<string, any> = { ...states };
      if (propKeys && Array.isArray(propKeys)) {
        propKeys.map((key) => {
          props[key] = context.useProperty(
            (callback) => {
              emits[key] = callback;
              return () => {
                delete emits[key];
              };
            },
            () => states[key]
          );
        });
      }
      return props;
    };

    return {
      [entry]: (context: ReactiveComponentContext) => {
        return ({ children }: any) => {
          const props = getProps(context);
          return context.compose({
            item: tag as any,
            props,
            children: children ?? [],
          });
        };
      },
    };
  };
