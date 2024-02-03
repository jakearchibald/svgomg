import { Signal, useSignal, useSignalEffect } from '@preact/signals';
import {
  ProcessorOptimizeConfig,
  OptimizeConfig,
  RenderableSVG,
} from './types';
import mapObject from './utils/mapObject';
import { optimize } from './svgoProcessor';

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

export default function useOptimizeSVG(
  input: Signal<RenderableSVG | null>,
  optimizeConfig: OptimizeConfig,
): Signal<RenderableSVG | null> {
  const optimizedSVG = useSignal<RenderableSVG | null>(null);

  useSignalEffect(() => {
    input.valueOf();
    // Clear the cache when the source changes.
    return () => compressCache.clear();
  });

  useSignalEffect(() => {
    if (!input.value) {
      optimizedSVG.value = null;
      return;
    }

    const clonableOptimizeConfig: ProcessorOptimizeConfig = {
      pretty: optimizeConfig.pretty.enabled.value ? {} : undefined,
      plugins: mapObject(
        optimizeConfig.plugins,
        ([name, settings]) => settings.enabled.value && [name, {}],
      ),
    };

    const cacheKey = JSON.stringify(clonableOptimizeConfig);
    const cacheResult = compressCache.get(cacheKey);

    if (cacheResult) {
      optimizedSVG.value = cacheResult;
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    optimize(input.value.source, clonableOptimizeConfig, { signal })
      .then((result) => {
        signal.throwIfAborted();
        addToCache(cacheKey, result);
        optimizedSVG.value = result;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  });

  return optimizedSVG;
}
