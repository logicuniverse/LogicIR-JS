import { NodeTemplate } from './node-template';

export type PackageNodeItem = {
  key: string;
  icon?: string;
  displayName: string;
  description?: string;
  //   provisions?: Record<
  //     string, // sub flow group key
  //     Record<
  //       string, // injection key
  //       {
  //         packageId?: string;
  //         serviceKey: string;
  //         scope?: string[];
  //       }
  //     >
  //   >;
};

export type PackageCategory = {
  displayName: string;
  description?: string;
  icon?: string;
  children: PackageItem[]; // string means node template
};

export type PackageItem = PackageCategory | PackageNodeItem;

export enum ServiceItemKind {
  NodeTemplate = 'NT',
  Service = 'SV',
}

export type ServiceItem = {
  kind: ServiceItemKind.NodeTemplate;
  nodeTemplateKey: string;
  packageId?: string; // undefined means same package
};
//   | {
//       kind: ServiceItemKind.Service;
//       service: PackageService;
//     };

export type PackageService = {
  isStateful?: boolean;
  icon?: string;
  displayName?: string;
  description?: string;
  items: Record<string, ServiceItem>;
};

export type PackageDefinitionContent = {
  nodeTemplates: Record<string, NodeTemplate>;
  services?: Record<string, PackageService>;
};

export type PackageDefinition = PackageCategory & PackageDefinitionContent;
