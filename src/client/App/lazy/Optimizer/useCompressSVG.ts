import { Signal, useSignal, useSignalEffect } from '@preact/signals';
import { ProcessorPluginConfig, PluginConfig } from './types';
import mapObject from './utils/mapObject';
import { compress } from './svgoProcessor';

const CACHE_SIZE = 10;
const compressCache = new Map<string, string>();

function addToCache(key: string, value: string) {
  compressCache.set(key, value);

  if (compressCache.size > CACHE_SIZE) {
    for (const key of compressCache.keys()) {
      compressCache.delete(key);
      if (compressCache.size <= CACHE_SIZE) break;
    }
  }
}

export default function useCompressSVG(
  source: Signal<string>,
  pluginConfig: PluginConfig,
): Signal<string> {
  const compressedSource = useSignal(source.value);

  // Clear the cache when the source changes.
  source.subscribe(() => compressCache.clear());

  useSignalEffect(() => {
    const clonablePluginConfig: ProcessorPluginConfig = mapObject(
      pluginConfig,
      ([name, settings]) => settings.enabled.value && [name, {}],
    );

    const cacheKey = JSON.stringify(clonablePluginConfig);
    const cacheResult = compressCache.get(cacheKey);

    if (cacheResult) {
      compressedSource.value = cacheResult;
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    compress(source.value, clonablePluginConfig, { signal })
      .then((result) => {
        addToCache(cacheKey, result);
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
