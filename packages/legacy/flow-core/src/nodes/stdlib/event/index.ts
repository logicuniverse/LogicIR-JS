import { NodeTemplate } from '../../../common';
import { eventHandlerTemplate } from './event-handler';
import { demuxNodeTemplate } from './demux';
import { emitTemplate } from './emit';
import { mapToTemplate } from './map-to';
import { muxNodeTemplate } from './mux';
import { mergeNodeTemplate } from './merge';

export const eventNodeTemplates: Record<string, NodeTemplate> = {
  'event.mux': muxNodeTemplate,
  'event.demux': demuxNodeTemplate,
  'event.handler': eventHandlerTemplate,
  'event.emit': emitTemplate,
  'event.mapTo': mapToTemplate,
  'event.merge': mergeNodeTemplate,
};
