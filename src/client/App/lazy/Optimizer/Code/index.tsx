import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import { Signal } from '@preact/signals';

import * as styles from './styles.module.css';

interface Props {
  source: Signal<string>;
}

const Config: FunctionComponent<Props> = ({ source }) => {
  return (
    <div class={styles.code}>
      <pre>
        <code>{source}</code>
      </pre>
    </div>
  );
};

export { Config as default };
