import { Signal, useSignal, useSignalEffect } from '@preact/signals';
import { ProcessorPluginConfig, PluginConfig, RenderableSVG } from './types';
import mapObject from './utils/mapObject';
import { compress } from './svgoProcessor';

const CACHE_SIZE = 10;
const compressCache = new Map<string, RenderableSVG>();

function addToCache(key: string, value: RenderableSVG) {
  compressCache.set(key, value);

  if (compressCache.size > CACHE_SIZE) {
    for (const key of compressCache.keys()) {
      compressCache.delete(key);
      if (compressCache.size <= CACHE_SIZE) break;
    }
  }
}

export default function useCompressSVG(
  input: Signal<RenderableSVG | null>,
  pluginConfig: PluginConfig,
): Signal<RenderableSVG | null> {
  const compressedSVG = useSignal<RenderableSVG | null>(null);

  useSignalEffect(() => {
    input.valueOf();
    // Clear the cache when the source changes.
    return () => compressCache.clear();
  });

  useSignalEffect(() => {
    if (!input.value) {
      compressedSVG.value = null;
      return;
    }

    const clonablePluginConfig: ProcessorPluginConfig = mapObject(
      pluginConfig,
      ([name, settings]) => settings.enabled.value && [name, {}],
    );

    const cacheKey = JSON.stringify(clonablePluginConfig);
    const cacheResult = compressCache.get(cacheKey);

    if (cacheResult) {
      compressedSVG.value = cacheResult;
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    compress(input.value.source, clonablePluginConfig, { signal })
      .then((result) => {
        signal.throwIfAborted();
        addToCache(cacheKey, result);
        compressedSVG.value = result;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  });

  return compressedSVG;
}
