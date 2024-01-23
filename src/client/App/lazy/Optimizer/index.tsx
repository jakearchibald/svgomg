import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Input } from '../..';

import * as styles from './styles.module.css';
import Toolbar from './Toolbar';
import { useViewTransition } from '../../../hooks/useViewTransition';

interface Props {
  input: Input;
  onMenuClick?: () => void;
}

const tabNames = ['Image', 'Markup'] as const;

const Optimizer: FunctionComponent<Props> = ({ input, onMenuClick }) => {
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
    <div class={styles.optimizer}>
      <Toolbar
        tabNames={tabNames}
        activeTab={activeTab.value}
        onMenuClick={onMenuClick}
        onTabChange={onTabChange}
      />
    </div>
  );
};

export { Optimizer as default };
