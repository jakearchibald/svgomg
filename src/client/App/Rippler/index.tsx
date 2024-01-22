import { FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';

import * as styles from './styles.module.css';
import { animateFrom } from '../../utils/animate';

interface Props {}

const Rippler: FunctionComponent<Props> = ({ children }) => {
  const ripplerRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  function onPointerDown(event: PointerEvent) {
    const rippler = ripplerRef.current!;
    const ripple = rippleRef.current!;
    const { clientX, clientY } = event;

    const { left, top, width, height } = rippler.getBoundingClientRect();

    const x = clientX - left;
    const y = clientY - top;

    const endRadius = Math.hypot(
      Math.max(x, width - x),
      Math.max(y, height - y),
    );

    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.setProperty('--size', `${endRadius * 2}px`);

    animateFrom(
      ripple,
      { scale: 0 },
      {
        duration: 250,
        easing: 'ease',
      },
    );

    animateFrom(
      ripple,
      { opacity: 0.15 },
      { duration: 300, easing: 'ease-in-out', delay: 150 },
    );
  }

  return (
    <div onPointerDown={onPointerDown} ref={ripplerRef} class={styles.rippler}>
      <div ref={rippleRef} class={styles.ripple} />
      {children}
    </div>
  );
};

export { Rippler as default };
