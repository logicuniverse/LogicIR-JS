import type { HonoRouteNode, RouteEntry } from './types';

export const honoApp = (children: HonoRouteNode[]): HonoRouteNode => ({
  kind: 'app',
  path: '',
  children,
});

export const honoRoute = (
  path: string,
  children: HonoRouteNode[],
): HonoRouteNode => ({
  kind: 'route',
  path,
  children,
});

export const honoGet = (
  path: string,
  handlerName: string,
): HonoRouteNode => ({
  kind: 'get',
  path,
  handlerName,
});

export const materializeRoutes = (node: HonoRouteNode): RouteEntry[] =>
  visit(node, '');

const visit = (node: HonoRouteNode, prefix: string): RouteEntry[] => {
  if (node.kind === 'get') {
    return [
      {
        method: 'GET',
        path: normalizePath(`${prefix}${node.path}`),
        handlerName: node.handlerName ?? 'anonymous',
      },
    ];
  }

  const nextPrefix =
    node.kind === 'route' ? normalizePath(`${prefix}${node.path}`) : prefix;
  return (node.children ?? []).flatMap((child) => visit(child, nextPrefix));
};

const normalizePath = (path: string): string => {
  const normalized = `/${path}`
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');
  return normalized === '' ? '/' : normalized;
};
