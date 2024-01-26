import { FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';
import { Signal, useSignal } from '@preact/signals';
import { Input } from '../..';

import * as styles from './styles.module.css';
import Toolbar from './Toolbar';
import { useViewTransition } from '../../../hooks/useViewTransition';
import SafeIframe from './SafeIframe';
import { getDimensions } from './svgoProcessor';
import PinchZoom from './PinchZoom';
import Config from './Config';

interface Props {
  input: Input;
  inert: Signal<boolean>;
  onMenuClick?: () => void;
}

const tabNames = ['Image', 'Markup'] as const;

const Optimizer: FunctionComponent<Props> = ({ input, onMenuClick, inert }) => {
  const activeTab = useSignal<(typeof tabNames)[number]>(tabNames[0]);
  const startViewTransition = useViewTransition([activeTab.value]);
  const activeSource = useSignal(input.body);
  const activeWidth = useSignal(0);
  const activeHeight = useSignal(0);

  function onTabChange(newTab: (typeof tabNames)[number]) {
    startViewTransition({
      rootClassNames: ['tabChange'],
      update() {
        activeTab.value = newTab;
      },
    });
  }

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    getDimensions(signal, input.body).then(({ width, height }) => {
      activeWidth.value = width;
      activeHeight.value = height;
    });
  }, [input]);

  return (
    <div inert={inert} class={styles.optimizer}>
      <Toolbar
        tabNames={tabNames}
        activeTab={activeTab.value}
        onMenuClick={onMenuClick}
        onTabChange={onTabChange}
      />
      <div class={styles.editArea}>
        {activeWidth.value && activeHeight.value ? (
          <PinchZoom>
            <SafeIframe
              svgSource={activeSource}
              width={activeWidth}
              height={activeHeight}
            />
          </PinchZoom>
        ) : (
          <div />
        )}
        <Config />
      </div>
    </div>
  );
};

export { Optimizer as default };
