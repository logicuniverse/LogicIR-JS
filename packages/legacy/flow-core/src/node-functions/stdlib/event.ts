import { SimpleNodeFunction, simpleService2Service } from 'ff-runtime-core';
import { passthroughNodeFunction } from './utils/passthrough';

const emitNodeFunction: SimpleNodeFunction = ({ inputs, emit }) => {
  emit.data('output', inputs['input']);
};

const eventHandlerNodeFunction: SimpleNodeFunction = ({ inputs, inject }) => {
  let input = inputs['input'] as any[];
  const callbackFunction = inject('default', 'callbackBody')!;
  return callbackFunction({
    inputs: { input },
    inject: () => null,
    emit: {
      data: () => {},
      error: () => {},
    },
    subscribe: () => () => {},
  });
};

const mapToNodeFunction: SimpleNodeFunction = ({ inputs }) => {
  return inputs['value'];
};

export const eventService = simpleService2Service({
  'event.emit': emitNodeFunction,
  'event.mux': passthroughNodeFunction,
  'event.demux': passthroughNodeFunction,
  'event.handler': eventHandlerNodeFunction,
  'event.mapTo': mapToNodeFunction,
  'event.merge': passthroughNodeFunction,
});
