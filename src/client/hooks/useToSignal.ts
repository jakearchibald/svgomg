import { ReadonlySignal, useSignal } from '@preact/signals';

/** Convert a regular value to a signal */
export default function useToSignal<T>(value: T): ReadonlySignal<T> {
  const signal = useSignal(value);
  signal.value = value;
  return signal;
}
