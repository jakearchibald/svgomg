import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import { Signal, useComputed } from '@preact/signals';

import * as styles from './styles.module.css';

interface Props {
  svgSource: Signal<string>;
  width: Signal<number>;
  height: Signal<number>;
}

const SafeIframe: FunctionComponent<Props> = ({ svgSource, width, height }) => {
  const docSource = useComputed(
    () =>
      '<!DOCTYPE html><style>body{margin:0;}svg{display:block}</style>' +
      svgSource.value,
  );

  return (
    <iframe
      class={styles.iframe}
      width={width}
      height={height}
      srcDoc={docSource}
      sandbox="allow-scripts"
    />
  );
};

export { SafeIframe as default };
