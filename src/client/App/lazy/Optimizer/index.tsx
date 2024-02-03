import { FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import {
  Signal,
  useSignal,
  signal,
  useComputed,
  ReadonlySignal,
} from '@preact/signals';
import { Input } from '../..';

import * as styles from './styles.module.css';
import Toolbar from './Toolbar';
import { useViewTransition } from '../../../hooks/useViewTransition';
import SVGRenderer from './SVGRenderer';
import PinchZoom from './PinchZoom';
import Config from './Config';
import Code from './Code';
import pluginData from 'virtual:svgo-plugin-data';
import { PluginConfig, RenderableSVG } from './types';
import mapObject from './utils/mapObject';
import useOptimizeSVG from './useOptimizeSVG';
import useRenderableSVG from './useRenderableSVG';

interface Props {
  input: Input;
  inert: Signal<boolean>;
  onMenuClick?: () => void;
}

const tabNames = ['Image', 'Markup'] as const;

const Optimizer: FunctionComponent<Props> = ({ input, onMenuClick, inert }) => {
  // Model
  const inputSVG = useRenderableSVG(input.body);
  const pluginConfig: PluginConfig = useMemo(
    () =>
      mapObject(pluginData, ([name, settings]) => [
        name,
        { enabled: signal(settings.default) },
      ]),
    [],
  );

  const optimizedSVG = useOptimizeSVG(inputSVG, pluginConfig);

  // View
  const showOriginal = useSignal(false);
  const activeTab = useSignal<(typeof tabNames)[number]>(tabNames[0]);
  const startViewTransition = useViewTransition([activeTab.value]);
  const activeSVG = useComputed(() =>
    showOriginal.value || !optimizedSVG.value
      ? inputSVG.value
      : optimizedSVG.value,
  );
  const activeSource = useComputed(() => activeSVG.value?.source ?? '');
  const hasActiveSVG = useComputed(() => Boolean(activeSVG.value));

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
          <Code source={activeSource} />
        ) : (
          hasActiveSVG.value && (
            <PinchZoom>
              <SVGRenderer svg={activeSVG as ReadonlySignal<RenderableSVG>} />
            </PinchZoom>
          )
        )}

        <Config showOriginal={showOriginal} pluginConfig={pluginConfig} />
      </div>
    </div>
  );
};

export { Optimizer as default };
