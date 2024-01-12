import { FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';
import {
  Signal,
  useComputed,
  useSignal,
  useSignalEffect,
} from '@preact/signals';

import * as styles from './styles.module.css';

interface Props {
  show: Signal<boolean>;
  delay?: number;
}

const Spinner: FunctionComponent<Props> = ({ delay = 300, show }) => {
  const displayNone = useSignal(true);
  const containerStyle = useComputed(() =>
    displayNone.value ? 'display: none;' : '',
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useSignalEffect(() => {
    if (show.value === true) {
      const timeout = setTimeout(() => {
        displayNone.value = false;
      }, delay);

      return () => clearTimeout(timeout);
    }

    // show.value === false
    const anim = containerRef.current!.animate(
      { opacity: 0 },
      { duration: 400, easing: 'ease-in-out' },
    );

    anim.onfinish = () => {
      displayNone.value = true;
    };

    return () => anim.cancel();
  });

  return (
    <div ref={containerRef} class={styles.spinner} style={containerStyle}>
      <div class={styles.spinnerContainer}>
        <div class={styles.spinnerLayer}>
          <div class={styles.circleClipperLeft}>
            <div class={styles.circle} />
          </div>
          <div class={styles.gapPatch}>
            <div class={styles.circle} />
          </div>
          <div class={styles.circleClipperRight}>
            <div class={styles.circle} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Spinner as default };
