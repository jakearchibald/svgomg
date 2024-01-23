import { useLayoutEffect, useRef } from 'preact/hooks';

interface StartViewTransition {
  rootClassNames?: string[];
  update(): void;
}

export function useViewTransition(deps: ReadonlyArray<unknown> = []) {
  const pendingTransitionResolve = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    if (pendingTransitionResolve.current) {
      pendingTransitionResolve.current();
      pendingTransitionResolve.current = null;
    }
  }, deps);

  return ({ update, rootClassNames = [] }: StartViewTransition) => {
    if (!document.startViewTransition) {
      update();
      return;
    }

    document.documentElement.classList.add(...rootClassNames);

    const transition = document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          pendingTransitionResolve.current = resolve;
          update();
        }),
    );

    transition.finished.then(() => {
      document.documentElement.classList.remove(...rootClassNames);
    });
  };
}
