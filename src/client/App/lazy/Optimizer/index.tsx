import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import {} from '@preact/signals';
import { Input } from '../..';

import * as styles from './styles.module.css';
import Toolbar from './Toolbar';

interface Props {
  input: Input;
  onMenuClick?: () => void;
}

const Optimizer: FunctionComponent<Props> = ({ input, onMenuClick }) => {
  return (
    <div class={styles.optimizer}>
      <Toolbar
        tabNames={['image', 'markup'] as const}
        activeTab="image"
        onMenuClick={onMenuClick}
      />
    </div>
  );
};

export { Optimizer as default };
