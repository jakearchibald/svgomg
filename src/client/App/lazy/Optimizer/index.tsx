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
import { PluginConfig } from './types';
import mapObject from './utils/mapObject';
import useCompressSVG from './useCompressSVG';
import useSVGDimensions from './useSVGDimensions';

interface Props {
  input: Input;
  inert: Signal<boolean>;
  onMenuClick?: () => void;
}

const tabNames = ['Image', 'Markup'] as const;

const Optimizer: FunctionComponent<Props> = ({ input, onMenuClick, inert }) => {
  // Model
  const activeSource = useSignal(input.body);
  const [activeWidth, activeHeight] = useSVGDimensions(activeSource);
  const pluginConfig: PluginConfig = useMemo(
    () =>
      mapObject(pluginData, ([name, settings]) => [
        name,
        { enabled: signal(settings.default) },
      ]),
    [],
  );

  const compressedSource = useCompressSVG(activeSource, pluginConfig);

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
