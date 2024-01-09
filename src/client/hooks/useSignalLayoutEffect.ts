import { useRef, useLayoutEffect } from 'preact/hooks';
import { effect } from '@preact/signals';

export default function useSignalLayoutEffect(cb: () => void | (() => void)) {
  const callback = useRef(cb);
  callback.current = cb;
  useLayoutEffect(() => effect(() => callback.current()), []);
}
