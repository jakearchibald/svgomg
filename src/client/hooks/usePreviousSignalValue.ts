import { Signal, useSignal, useSignalEffect } from '@preact/signals';

export default function usePreviousSignalValue<T>(
  signal: Signal<T>,
): Signal<T | null> {
  const lastValue = useSignal<null | T>(null);
  const nextValue = useSignal<null | T>(null);

  useSignalEffect(() => {
    lastValue.value = nextValue.peek();
    nextValue.value = signal.value;
  });

  return lastValue;
}
