import { SimpleNodeFunction, simpleService2Service } from 'ff-runtime-core';

const delayMsNodeFunction: SimpleNodeFunction = ({ inputs }) => {
  const ms = inputs['ms'] as number;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const awaitNodeFunction: SimpleNodeFunction = ({ inputs, subscribe }) => {
  const current = Object.values(inputs)[0];
  let dispose: (() => void) | undefined = undefined;
  return new Promise((resolve, reject) => {
    console.log('await started', { current });
    if (current !== undefined) {
      resolve(current);
    }
    dispose = subscribe({
      data: (key, value) => {
        console.log('await received', { key, value });
        resolve(value);
        dispose?.();
      },
      error: (key, error) => {
        reject(error);
        dispose?.();
      },
    });
  });
};

export const asyncService = simpleService2Service({
  'async.delayMs': delayMsNodeFunction,
  'async.await': awaitNodeFunction,
});
