import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import { Signal } from '@preact/signals';

import * as styles from './styles.module.css';

interface Props {
  svgSource: Signal<string>;
  width: Signal<number>;
  height: Signal<number>;
}

const SafeIframe: FunctionComponent<Props> = ({ svgSource, width, height }) => {
  return (
    <iframe
      class={styles.iframe}
      width={width}
      height={height}
      srcDoc={svgSource}
      sandbox="allow-scripts"
    />
  );
};

export { SafeIframe as default };
