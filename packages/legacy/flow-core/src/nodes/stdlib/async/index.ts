import { NodeTemplate } from '../../../common';
import { awaitNodeTemplate } from './await';
import { delayMsNodeTemplate } from './delay-ms';

export const asyncNodeTemplates: Record<string, NodeTemplate> = {
  'async.await': awaitNodeTemplate,
  'async.delayMs': delayMsNodeTemplate,
};
