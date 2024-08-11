import { useEffect, useState } from "react";

export function useSet<T>(initValue?: Iterable<T> | null | undefined) {
  const [state, setState] = useState(() => ({ set: new _Set<T>(initValue) }));

  useEffect(() => {
    const unsubscribe = state.set.onChange(() => {
      setState((prev) => ({ set: prev.set }));
    });

    return unsubscribe;
  }, [state.set]);

  return state.set as Set<T>;
}

type MutableEvent = () => void;

class _Set<T> extends Set<T> {
  mutableEvents: MutableEvent[] = [];

  override add(value: T) {
    const result = super.add(value);
    this.mutableEvent();
    return result;
  }

  override delete(value: T) {
    const result = super.delete(value);
    this.mutableEvent();
    return result;
  }

  override clear() {
    const result = super.clear();
    this.mutableEvent();
    return result;
  }

  onChange(fn: MutableEvent) {
    this.mutableEvents.push(fn);
    return () => {
      this.mutableEvents = this.mutableEvents.filter((event) => event !== fn);
    };
  }

  private mutableEvent() {
    for (const event of this.mutableEvents) {
      event();
    }
  }
}
