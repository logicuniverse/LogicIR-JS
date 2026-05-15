import type { JsonValue } from './types';

export const stableStringify = (value: JsonValue): string => {
  if (value === null) {
    return 'null';
  }

  if (typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`;
};

export const hashJson = (value: JsonValue): string => {
  const text = stableStringify(value);
  let hash = 0x811c9dc5;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
};

export const cloneJson = <T extends JsonValue>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;
