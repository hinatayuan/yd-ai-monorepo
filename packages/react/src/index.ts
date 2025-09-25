export type ReactNode = ReactElement | string | number | boolean | null | undefined;

export interface ReactElement<P = Record<string, unknown>> {
  readonly type: any;
  readonly key: string | number | null;
  readonly props: P & { children?: ReactNode | ReactNode[] };
}

interface HookState {
  value?: unknown;
  deps?: ReadonlyArray<unknown>;
  cleanup?: (() => void) | undefined;
  ref?: { current: unknown };
}

interface EffectEntry {
  run: () => void;
}

export interface HookBucket {
  hooks: HookState[];
  effects: EffectEntry[];
  rerender: () => void;
}

let currentBucket: HookBucket | null = null;
let hookCursor = 0;

const FragmentSymbol = Symbol.for('react.fragment');

export const Fragment = FragmentSymbol;

export function createElement(type: any, props: any, ...children: ReactNode[]): ReactElement {
  const normalizedProps = props ?? {};
  if (children.length === 1) {
    normalizedProps.children = children[0];
  } else if (children.length > 1) {
    normalizedProps.children = children;
  }

  return {
    type,
    key: normalizedProps.key ?? null,
    props: normalizedProps,
  };
}

export function useState<S>(initial: S | (() => S)): [S, (next: S | ((prev: S) => S)) => void] {
  const bucket = ensureBucket('useState');
  const index = hookCursor++;
  const hook = bucket.hooks[index] ?? (bucket.hooks[index] = {});

  if (!('value' in hook)) {
    hook.value = typeof initial === 'function' ? (initial as () => S)() : initial;
  }

  const setState = (next: S | ((prev: S) => S)) => {
    const current = hook.value as S;
    const resolved = typeof next === 'function' ? (next as (prev: S) => S)(current) : next;
    if (!Object.is(resolved, current)) {
      hook.value = resolved;
      bucket.rerender();
    }
  };

  return [hook.value as S, setState];
}

export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<unknown>): void {
  const bucket = ensureBucket('useEffect');
  const index = hookCursor++;
  const hook = bucket.hooks[index] ?? (bucket.hooks[index] = {});

  if (shouldUpdateDeps(hook.deps, deps)) {
    hook.deps = deps ? [...deps] : undefined;
    bucket.effects.push({
      run: () => {
        if (typeof hook.cleanup === 'function') {
          hook.cleanup();
        }
        const cleanup = effect();
        hook.cleanup = typeof cleanup === 'function' ? cleanup : undefined;
      },
    });
  }
}

export function useMemo<T>(factory: () => T, deps?: ReadonlyArray<unknown>): T {
  const bucket = ensureBucket('useMemo');
  const index = hookCursor++;
  const hook = bucket.hooks[index] ?? (bucket.hooks[index] = {});

  if (shouldUpdateDeps(hook.deps, deps)) {
    hook.deps = deps ? [...deps] : undefined;
    hook.value = factory();
  }

  return hook.value as T;
}

export function useCallback<T extends (...args: never[]) => unknown>(callback: T, deps?: ReadonlyArray<unknown>): T {
  return useMemo(() => callback, deps);
}

export function useRef<T>(initial: T): { current: T } {
  const bucket = ensureBucket('useRef');
  const index = hookCursor++;
  const hook = bucket.hooks[index] ?? (bucket.hooks[index] = {});

  if (!hook.ref) {
    hook.ref = { current: initial };
  }

  return hook.ref as { current: T };
}

export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
  prepareForRender(bucket: HookBucket) {
    currentBucket = bucket;
    hookCursor = 0;
    bucket.effects.length = 0;
  },
  finishRender() {
    const bucket = ensureBucket('finishRender');
    currentBucket = null;
    return bucket.effects.splice(0, bucket.effects.length);
  },
};

function ensureBucket(api: string): HookBucket {
  if (!currentBucket) {
    throw new Error(`${api} 只能在组件渲染期间调用`);
  }
  return currentBucket;
}

function shouldUpdateDeps(prev?: ReadonlyArray<unknown>, next?: ReadonlyArray<unknown>): boolean {
  if (!prev || !next) {
    return true;
  }
  if (prev.length !== next.length) {
    return true;
  }
  for (let index = 0; index < next.length; index += 1) {
    if (!Object.is(prev[index], next[index])) {
      return true;
    }
  }
  return false;
}

declare global {
  namespace JSX {
    interface Element extends ReactElement {}
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      [element: string]: Record<string, unknown>;
    }
  }
}
