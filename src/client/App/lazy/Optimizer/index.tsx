import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Input } from '../..';

import * as styles from './styles.module.css';
import Toolbar from './Toolbar';

interface Props {
  input: Input;
  onMenuClick?: () => void;
}

const tabNames = ['Image', 'Markup'] as const;

const Optimizer: FunctionComponent<Props> = ({ input, onMenuClick }) => {
  const activeTab = useSignal<(typeof tabNames)[number]>(tabNames[0]);

  return (
    <div class={styles.optimizer}>
      <Toolbar
        tabNames={tabNames}
        activeTab={activeTab.value}
        onMenuClick={onMenuClick}
        onTabChange={(tab) => (activeTab.value = tab)}
      />
    </div>
  );
};

export { Optimizer as default };
