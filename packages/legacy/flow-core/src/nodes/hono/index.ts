import { PackageDefinition } from '../../common';
import {
  honoGetNodeTemplate,
  honoAppNodeTemplate,
  honoRouteNodeTemplate,
} from './hono';

// export const honoService: ServiceContent = {
//   items: {
//     honoApp: {
//       nodeTemplate: honoNodeTemplate,
//       provisions: {
//         app: {
//           isStateful: true,
//           items: {
//             get: { nodeTemplate: honoAppGetNodeTemplate },
//           },
//         },
//       },
//     },
//   },
// };

// export const honoPackage: PackageContent = {
//   displayName: 'hono',
//   services: {
//     hono: honoService,
//   },
// };
export const honoPackage: PackageDefinition = {
  displayName: 'Hono',
  children: [
    {
      displayName: 'Hono App',
      key: 'hono.app',
    },
    {
      displayName: 'Hono Route',
      key: 'hono.route',
    },
    {
      displayName: 'Hono GET',
      key: 'hono.get',
    },
  ],
  nodeTemplates: {
    'hono.app': honoAppNodeTemplate,
    'hono.route': honoRouteNodeTemplate,
    'hono.get': honoGetNodeTemplate,
  },
};
