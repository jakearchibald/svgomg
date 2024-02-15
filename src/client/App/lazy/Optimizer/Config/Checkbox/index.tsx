import { FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';
import { Signal } from '@preact/signals';

import * as styles from './styles.module.css';
import { animateFrom } from '../../../../../utils/animate';

interface Props {
  checked: Signal<boolean>;
}

const Checkbox: FunctionComponent<Props> = ({ checked }) => {
  const elRef = useRef<HTMLDivElement>(null);

  // Stop parent ripplers
  const onPointerDown = (event: PointerEvent) => {
    event.stopPropagation();
  };

  const onClick = () => {
    animateFrom(
      elRef.current!,
      { opacity: 0.25 },
      { duration: 500, easing: 'ease', pseudoElement: '::before' },
    );
  };

  return (
    <div
      ref={elRef}
      class={styles.checkbox}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      <div class={styles.box}></div>
      <svg viewBox="0 0 36 36">
        <path d="M 8 19 L 14 24.5 L 28 11" />
      </svg>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => (checked.value = event.currentTarget.checked)}
      />
    </div>
  );
};

export { Checkbox as default };
