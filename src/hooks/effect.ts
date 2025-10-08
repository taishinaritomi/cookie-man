import { type DependencyList, useEffect, useRef } from "react";

export function useEffectUntil(
  effect: () => undefined | boolean,
  deps: DependencyList,
) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;

    const result = effect();

    if (result === true) {
      done.current = true;
    }

    return () => {
      done.current = false;
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: deps
  }, deps);
}
