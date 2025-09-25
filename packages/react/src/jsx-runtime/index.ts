import type { ReactElement } from '../index.js';
import { Fragment } from '../index.js';

export { Fragment };

export function jsx(type: any, props: Record<string, unknown> | null, key?: string | number | null): ReactElement {
  return createElementRecord(type, props, key);
}

export function jsxs(type: any, props: Record<string, unknown> | null, key?: string | number | null): ReactElement {
  return createElementRecord(type, props, key);
}

export const jsxDEV = jsx;

function createElementRecord(type: any, props: Record<string, unknown> | null, key?: string | number | null): ReactElement {
  const normalizedProps: Record<string, unknown> = props ? { ...props } : {};
  const normalizedKey = key ?? null;
  return {
    type,
    key: normalizedKey,
    props: normalizedProps as any,
  };
}
