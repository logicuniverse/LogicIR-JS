import { EditorReservedNodeKey, NodeTemplate } from '../common';
import { goBackIfNodeTemplate } from './reserved/go-back-if';
import { returnIfTemplate } from './reserved/return-if';
import { stdPackage } from './stdlib';
import { PackageDefinition } from '../common/types/package';
import { reactDomPackage } from './react-dom';
import { htmlPackage } from './html';
import { celPackage } from './cel';
import { piAiPackage } from './pi-ai';
// import { honoPackage } from './hono';

// export const packages: Record<string, PackageContent> = {
//   stdlib: stdlibPackage,
//   hono: honoPackage,
//   html: htmlPackageService,
//   reactDom: reactDomPackageService,
// };

export const pkgs: Record<string, PackageDefinition> = {
  std: stdPackage,
  reactDom: reactDomPackage,
  html: htmlPackage,
  cel: celPackage,
  piAi: piAiPackage,
  // hono: honoPackage,
};

export const reservedNodeTemplates: Record<string, NodeTemplate> = {
  [EditorReservedNodeKey.GoBackIf]: goBackIfNodeTemplate,
  [EditorReservedNodeKey.ReturnIf]: returnIfTemplate,
};
