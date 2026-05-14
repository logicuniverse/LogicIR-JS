declare module 'fs' {
  export function mkdirSync(
    path: string,
    options?: { recursive?: boolean },
  ): void;
  export function writeFileSync(path: string, data: string): void;
}

declare module 'path' {
  export function join(...parts: string[]): string;
}
