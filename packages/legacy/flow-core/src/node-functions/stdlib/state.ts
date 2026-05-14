import { SimpleNodeFunction, simpleService2Service } from 'ff-runtime-core';

const propertyNodeFunction: SimpleNodeFunction = ({
  inputs,
  emit,
  subscribe,
  getState,
}) => {
  const state = getState?.('output');
  subscribe({
    data: (key, value) => {
      emit.data('output', value);
    },
    error: (key, error) => {
      emit.error('output', error);
    },
  });
  return {
    output: state === undefined ? inputs['initial'] : state,
  };
};

const arrayPropertyNodeFunction: SimpleNodeFunction = ({
  inputs,
  subscribe,
  emit,
  getState,
}) => {
  const state = getState?.('value');
  subscribe({
    data: (key, value) => {
      const currentValue = getState!('value') as any[];
      if (key === 'push') {
        emit.data('value', [...currentValue, value]);
      } else if (key === 'pop') {
        emit.data('value', currentValue.slice(0, -1));
      } else if (key === 'shift') {
        emit.data('value', currentValue.slice(1));
      } else if (key === 'unshift') {
        emit.data('value', [value, ...currentValue]);
      } else if (key === 'sort') {
        emit.data('value', [...currentValue].sort());
      } else if (key === 'reverse') {
        emit.data('value', [...currentValue].reverse());
      }
    },
    error: (key, error) => {},
  });
  return {
    value:
      state === undefined ? [...((inputs['initial'] ?? []) as any[])] : state,
  };
};

const numberPropertyNodeFunction: SimpleNodeFunction = ({
  inputs,
  subscribe,
  emit,
  getState,
}) => {
  const state = getState?.('value');
  subscribe({
    data: (key, value) => {
      const currentValue = getState!('value') as number;
      if (key === 'set') {
        emit.data('value', value as number);
      } else if (key === 'add') {
        emit.data('value', currentValue + (value as number));
      } else if (key === 'subtract') {
        emit.data('value', currentValue - (value as number));
      } else if (key === 'increment') {
        emit.data('value', currentValue + 1);
      } else if (key === 'decrement') {
        emit.data('value', currentValue - 1);
      }
    },
    error: (key, error) => {},
  });
  return {
    value: state === undefined ? (inputs['initial'] as number) : state,
  };
};

const booleanPropertyNodeFunction: SimpleNodeFunction = ({
  inputs,
  subscribe,
  emit,
  getState,
}) => {
  const state = getState?.('value');
  subscribe({
    data: (key, value) => {
      const currentValue = getState!('value') as boolean;
      if (key === 'set') {
        emit.data('value', value as boolean);
      } else if (key === 'toggle') {
        emit.data('value', !currentValue);
      } else if (key === 'setTrue') {
        emit.data('value', true);
      } else if (key === 'setFalse') {
        emit.data('value', false);
      }
    },
    error: (key, error) => {},
  });
  return {
    value: state === undefined ? (inputs['initial'] as boolean) : state,
  };
};

const objectPropertyNodeFunction: SimpleNodeFunction = ({
  inputs,
  subscribe,
  emit,
  getState,
}) => {
  const state = getState?.('value');
  subscribe({
    data: (key, value) => {
      const currentValue = getState!('value') as Record<string, any>;
      if (key === 'set') {
        emit.data('value', value as Record<string, any>);
      } else if (key === 'delete') {
        const newVal: Record<string, any> = {};
        Object.keys(currentValue).forEach((k) => {
          if (k !== (value as string)) {
            newVal[k] = currentValue[k];
          }
        });
        emit.data('value', newVal);
      }
    },
    error: (key, error) => {},
  });
  return {
    value:
      state === undefined
        ? { ...(inputs['initial'] as Record<string, any>) }
        : state,
  };
};

const stringPropertyNodeFunction: SimpleNodeFunction = ({
  inputs,
  subscribe,
  emit,
  getState,
}) => {
  const state = getState?.('value');
  subscribe({
    data: (key, value) => {
      const currentValue = getState!('value') as string;
      if (key === 'prepend') {
        emit.data('value', (value as string) + currentValue);
      } else if (key === 'concat') {
        emit.data('value', currentValue + (value as string));
      }
    },
    error: (key, error) => {},
  });
  return {
    value: state === undefined ? (inputs['initial'] as string) : state,
  };
};

export const stateService = simpleService2Service({
  property: propertyNodeFunction,
  'property.array': arrayPropertyNodeFunction,
  'property.number': numberPropertyNodeFunction,
  'property.boolean': booleanPropertyNodeFunction,
  'property.object': objectPropertyNodeFunction,
  'property.string': stringPropertyNodeFunction,
});
