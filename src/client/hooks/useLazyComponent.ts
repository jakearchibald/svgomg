import {} from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { FunctionComponent } from 'preact';
import useSignalLayoutEffect from './useSignalLayoutEffect';

export default function useLazyComponent<T extends FunctionComponent<any>>(
  promise: Promise<T>,
): T | null {
  const componentSignal = useSignal<T | null>(null);

  useSignalLayoutEffect(() => {
    let cancelled = false;

    promise.then((value) => {
      if (cancelled) return;
      componentSignal.value = value;
    });

    return () => {
      cancelled = true;
    };
  });

  return componentSignal.value;
}
