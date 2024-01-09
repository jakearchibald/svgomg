import { useSignal } from '@preact/signals';
import {} from 'preact/hooks';
import useSignalLayoutEffect from './useSignalLayoutEffect';

export default function useClientJSReady() {
  const isClient = useSignal(false);

  useSignalLayoutEffect(() => {
    isClient.value = true;
  });

  return isClient;
}
