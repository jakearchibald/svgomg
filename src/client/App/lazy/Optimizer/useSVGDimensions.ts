import { Signal, useSignal, useSignalEffect } from '@preact/signals';
import { getDimensions } from './svgoProcessor';

export default function useSVGDimensions(
  source: Signal<string>,
): [width: Signal<number>, height: Signal<number>] {
  const widthSignal = useSignal(0);
  const heightSignal = useSignal(0);

  useSignalEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    getDimensions(source.value, { signal })
      .then(({ width, height }) => {
        widthSignal.value = width;
        heightSignal.value = height;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  });

  return [widthSignal, heightSignal];
}
