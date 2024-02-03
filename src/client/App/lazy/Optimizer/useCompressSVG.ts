import { Signal, useSignal, useSignalEffect } from '@preact/signals';
import { ClonablePluginConfig, PluginConfig } from './types';
import mapObject from './utils/mapObject';
import { compress } from './svgoProcessor';

export default function useCompressSVG(
  source: Signal<string>,
  pluginConfig: PluginConfig,
): Signal<string> {
  const compressedSource = useSignal(source.value);

  useSignalEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const clonablePluginConfig: ClonablePluginConfig = mapObject(
      pluginConfig,
      ([name, settings]) => [name, { enabled: settings.enabled.value }],
    );

    compress(source.value, clonablePluginConfig, { signal })
      .then((result) => {
        compressedSource.value = result;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  });

  return compressedSource;
}
