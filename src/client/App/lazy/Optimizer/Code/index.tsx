import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import { Signal, useSignal } from '@preact/signals';

import * as styles from './styles.module.css';
import useSignalLayoutEffect from '../../../../hooks/useSignalLayoutEffect';
import { highlight } from '../prismProcessor';

interface Props {
  source: Signal<string>;
}

const Config: FunctionComponent<Props> = ({ source }) => {
  const highlightedSource = useSignal('');

  useSignalLayoutEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    highlight(source.value, { signal })
      .then((highlighted) => {
        highlightedSource.value = highlighted;
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  });

  return (
    <div class={styles.code}>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: highlightedSource.value }} />
      </pre>
    </div>
  );
};

export { Config as default };
