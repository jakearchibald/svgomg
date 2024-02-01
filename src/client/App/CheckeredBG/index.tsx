import { FunctionComponent } from 'preact';
import { useComputed, useSignal, Signal } from '@preact/signals';

import * as styles from './styles.module.css';

interface Props {
  dark: Signal<boolean>;
}

const CheckeredBG: FunctionComponent<Props> = ({ dark }) => {
  const darkStyle = useComputed(() => `opacity: ${dark.value ? 1 : 0};`);

  return (
    <div class={styles.checkers}>
      <div class={styles.lightBackground} />
      <div class={styles.darkBackground} style={darkStyle} />
      <div class={styles.pattern} />
    </div>
  );
};

export { CheckeredBG as default };
