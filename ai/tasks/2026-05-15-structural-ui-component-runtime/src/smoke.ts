import { legacyUINodeSnapshots } from './legacy-ui-snapshot';
import {
  flattenChildren,
  renderReactAppHeadless,
  triggerEvent,
} from './runtime';
import { eventLog, panel, titleProperty } from './fixtures';
import type { ComponentNode, ComponentText, SmokeReport } from './types';

const firstRender = renderReactAppHeadless('root', panel());
const firstTree = firstRender.tree as ComponentNode;
const firstText = flattenChildren(firstTree)[0] as ComponentText;

const eventTriggered = triggerEvent(firstTree, 'onClick', 'clicked');
titleProperty.update('updated');

const secondRender = renderReactAppHeadless('root', panel());
const secondTree = secondRender.tree as ComponentNode;
const secondText = flattenChildren(secondTree)[0] as ComponentText;

const checks = [
  legacyUINodeSnapshots['reactDom.reactApp'].kind === 'react-app',
  legacyUINodeSnapshots['html.div'].destructuring?.children === 'array',
  firstRender.domNode === 'root',
  firstTree.item === 'div',
  firstTree.props?.className === 'panel',
  firstText === 'hello',
  secondText === 'updated',
  eventTriggered,
  eventLog.length === 1,
  flattenChildren(secondTree).length === 2,
];

const failed = checks.filter((ok) => !ok).length;
if (failed > 0) {
  throw new Error(`${failed} structural UI component checks failed.`);
}

const report: SmokeReport = {
  task: 'structural-ui-component-runtime',
  status: 'passed',
  rootItem: firstTree.item ?? '',
  textBefore: firstText,
  textAfter: secondText,
  emittedEvents: eventLog.length,
  childCount: flattenChildren(secondTree).length,
};

console.log(JSON.stringify(report, null, 2));
