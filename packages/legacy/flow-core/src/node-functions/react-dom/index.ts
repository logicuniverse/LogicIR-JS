import {
  Service,
  SimpleNodeEventHandler,
  SimpleNodeFunction,
  simpleService2Service,
} from 'ff-runtime-core';

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ReactiveComponentContext } from '../utils/types';

type ReactComponentContext = ReactiveComponentContext<
  React.FunctionComponent<any> | string,
  React.ReactNode
>;

const getReactContext: (react: typeof React) => ReactComponentContext = (
  react
) => ({
  // render: (type, props, ...children) => {
  //   const transformedProps = { ...props };
  //   if (props?.['class']) {
  //     transformedProps['className'] = props['class'];
  //     delete transformedProps['class'];
  //   }
  //   return react.createElement(type, transformedProps, ...children);
  // },
  useProperty: (subscribe: any, readSnapshot: any) =>
    react.useSyncExternalStore(subscribe, readSnapshot),
  compose: (data) => {
    if (data.item) {
      //   react.useEffect(() => {
      //     data.lifeCycleCallbacks?.onStart?.();
      //     return () => {
      //       data.lifeCycleCallbacks?.onEnd?.();
      //     };
      //   }, []);
      const transformedProps = { ...data.props };
      if (data?.props?.['class']) {
        transformedProps['className'] = data.props['class'];
        delete transformedProps['class'];
      }
      const props =
        Object.keys(transformedProps).length > 0 ? transformedProps : null;

      if (Array.isArray(data.children)) {
        return react.createElement(data.item, props, ...data.children);
      } else {
        if (Object.keys(data.children).length > 0) {
          return react.createElement(data.item, {
            ...props,
            children: Object.values(data.children),
          });
        }
        return react.createElement(data.item, props);
      }
    } else {
      if (Array.isArray(data.children)) {
        const notNullChildren = data.children.filter((x) => !!x);
        if (notNullChildren.length === 0) {
          return null;
        } else if (notNullChildren.length === 1) {
          return notNullChildren[0];
        }
        return react.createElement(react.Fragment, null, ...data.children);
      } else {
        return react.createElement(
          react.Fragment,
          null,
          ...Object.values(data.children)
        );
      }
    }
  },
});

const reactAppFunction: SimpleNodeFunction = ({
  inputs,
  inject,
  subscribe,
  emit,
}) => {
  const el = inputs['domNode'];
  const element = document.getElementById(el as string);
  if (!element) {
    throw new Error(`Element not found: ${el}`);
  }
  const root = createRoot(element);
  const reactContext = getReactContext(React);
  const subflowFunction = inject('default', 'render')!;
  const renderFunction = () => {
    let dispatch: SimpleNodeEventHandler | undefined = undefined;
    subscribe({
      data: (key, value, subflowKey) => {
        if (subflowKey && dispatch) {
          dispatch.data(key, value, null);
        }
      },
      error: (key, error, subflowKey) => {
        if (subflowKey && dispatch) {
          dispatch.error(key, error, null);
        }
      },
    });
    const result = subflowFunction({
      inputs: {},
      inject: () => null,
      emit: {
        data: (key, value) => {},
        error: (key, error) => {},
      },
      subscribe: (handlers) => {
        // dispatch = handlers.data;
        dispatch = handlers;
        return () => {};
      },
    }) as Record<string, (context: ReactComponentContext) => any>;
    const root = Object.values(result)[0];

    return reactContext.compose({
      item: root(reactContext),
      children: {},
    });
  };
  root.render(reactContext.compose({ item: renderFunction, children: {} }));
};

export const reactDomService: Service = simpleService2Service({
  'reactDom.reactApp': reactAppFunction,
});
