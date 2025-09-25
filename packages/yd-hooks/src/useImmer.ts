import { useCallback, useState } from 'react';

export type ImmerRecipe<S> = (draft: S) => void | S;
export type ImmerUpdater<S> = (recipe: ImmerRecipe<S>) => void;

export function useImmer<S>(initialValue: S | (() => S)): [S, ImmerUpdater<S>] {
  const [state, setState] = useState(initialValue);

  const update = useCallback<ImmerUpdater<S>>(
    (recipe) => {
      setState((current: S) => {
        const draft = clone(current);
        const result = recipe(draft);
        return (result === undefined ? draft : result) as S;
      });
    },
    [setState],
  );

  return [state, update];
}

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}
