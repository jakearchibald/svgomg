import { FunctionComponent } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import { Signal, useSignal, useSignalEffect, signal } from '@preact/signals';
import { Input } from '../..';

import * as styles from './styles.module.css';
import Toolbar from './Toolbar';
import { useViewTransition } from '../../../hooks/useViewTransition';
import SafeIframe from './SafeIframe';
import { getDimensions, compress } from './svgoProcessor';
import PinchZoom from './PinchZoom';
import Config from './Config';
import Code from './Code';
import pluginData from 'virtual:svgo-plugin-data';
import { ClonablePluginConfig, PluginConfig } from './types';
import mapObject from './utils/mapObject';

interface Props {
  input: Input;
  inert: Signal<boolean>;
  onMenuClick?: () => void;
}

const tabNames = ['Image', 'Markup'] as const;

const Optimizer: FunctionComponent<Props> = ({ input, onMenuClick, inert }) => {
  // Model
  const activeSource = useSignal(input.body);
  const compressedSource = useSignal(input.body);
  const activeWidth = useSignal(0);
  const activeHeight = useSignal(0);
  const pluginConfig: PluginConfig = useMemo(
    () =>
      mapObject(pluginData, ([name, settings]) => [
        name,
        { enabled: signal(settings.default) },
      ]),
    [],
  );

  // View
  const activeTab = useSignal<(typeof tabNames)[number]>(tabNames[0]);
  const startViewTransition = useViewTransition([activeTab.value]);

  function onTabChange(newTab: (typeof tabNames)[number]) {
    startViewTransition({
      rootClassNames: ['tabChange'],
      update() {
        activeTab.value = newTab;
      },
    });
  }

  // Read dimensions
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    getDimensions(input.body, { signal })
      .then(({ width, height }) => {
        activeWidth.value = width;
        activeHeight.value = height;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  }, [input]);

  // Compress
  useSignalEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const clonablePluginConfig: ClonablePluginConfig = mapObject(
      pluginConfig,
      ([name, settings]) => [name, { enabled: settings.enabled.value }],
    );

    compress(activeSource.value, clonablePluginConfig, { signal })
      .then((result) => {
        compressedSource.value = result;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  });

  return (
    <div inert={inert} class={styles.optimizer}>
      <Toolbar
        tabNames={tabNames}
        activeTab={activeTab.value}
        onMenuClick={onMenuClick}
        onTabChange={onTabChange}
      />
      <div class={styles.editArea}>
        {activeTab.value === 'Markup' ? (
          <Code source={compressedSource} />
        ) : (
          <>
            {activeWidth.value && activeHeight.value ? (
              <PinchZoom>
                <SafeIframe
                  svgSource={compressedSource}
                  width={activeWidth}
                  height={activeHeight}
                />
              </PinchZoom>
            ) : (
              <div />
            )}
          </>
        )}

        <Config pluginConfig={pluginConfig} />
      </div>
    </div>
  );
};

export { Optimizer as default };
