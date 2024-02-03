import { Signal, useComputed, useSignal } from '@preact/signals';
import { getDimensions } from './svgoProcessor';
import useSignalLayoutEffect from '../../../hooks/useSignalLayoutEffect';
import { RenderableSVG } from './types';
import useToSignal from '../../../hooks/useToSignal';

export default function useRenderableSVG(
  source: string,
): Signal<RenderableSVG | null> {
  const sourceSignal = useToSignal(source);
  const renderableSVG = useSignal<RenderableSVG | null>(null);

  useSignalLayoutEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    renderableSVG.value = null;

    getDimensions(sourceSignal.value, { signal })
      .then(({ width, height }) => {
        signal.throwIfAborted();

        renderableSVG.value = {
          source: sourceSignal.value,
          width,
          height,
        };
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  });

  return renderableSVG;
}
