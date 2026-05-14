import { SimpleNodeFunction } from 'ff-runtime-core';
import { SimpleNodeTemplate } from '../../../nodes/utils';

export const getObjectMethodNodeFunction = (
  key: string,
  content: SimpleNodeTemplate,
  object?: any
): SimpleNodeFunction => {
  return ({ inputs, inject }) => {
    const values = Object.values(inputs);
    const obj = object ?? (values[0] as any);
    const args: any[] = [];
    content.params?.slice(!!object ? 0 : 1).forEach((param, index) => {
      if (param.fn) {
        const subFlowRunFunction = inject('default', param.key)!;
        args.push((...fArgs: any[]) => {
          const inputs: Record<string, any> = {};
          param.fn!.params?.forEach((fnParam, fnIndex) => {
            inputs[fnParam.key] = fArgs[fnIndex];
          });
          return subFlowRunFunction({
            inputs,
            inject: () => null,
            emit: {
              data: () => {},
              error: () => {},
            },
            subscribe: () => () => {},
          });
        });
      } else {
        args.push(inputs[param.key]);
      }
    });
    return obj[key](...args);
  };
};

export const getObjectMethodNodeFunctions = (
  val: Record<string, SimpleNodeTemplate>,
  prefiex?: string,
  object?: any
): Record<string, SimpleNodeFunction> => {
  const functions: Record<string, SimpleNodeFunction> = {};
  Object.entries(val).forEach(([key, simpleNodeTemplate]) => {
    const functionKey = prefiex ? `${prefiex}.${key}` : key;
    functions[functionKey] = getObjectMethodNodeFunction(
      key,
      simpleNodeTemplate,
      object
    );
  });
  return functions;
};
