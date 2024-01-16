import { FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';

import * as styles from './styles.module.css';
import { useComputed, useSignal } from '@preact/signals';

interface Props {
  onDrop: (file: File) => void;
}

const FileDrop: FunctionComponent<Props> = ({ onDrop }) => {
  const dragOver = useSignal(false);
  const inert = useComputed(() => !dragOver.value);
  const style = useComputed(() => (dragOver.value ? 'opacity: 1' : ''));

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    document.addEventListener(
      'dragover',
      (event) => {
        event.preventDefault();
      },
      { signal },
    );

    document.addEventListener(
      'dragenter',
      () => {
        dragOver.value = true;
      },
      { signal },
    );

    document.addEventListener(
      'dragleave',
      () => {
        dragOver.value = false;
      },
      { signal },
    );

    document.addEventListener(
      'drop',
      (event) => {
        event.preventDefault();

        const file = event.dataTransfer!.files[0];
        if (!file) return;

        onDrop(file);
      },
      { signal },
    );

    return () => controller.abort();
  }, []);

  return (
    <div inert={inert} style={style} class={styles.dropOverlay}>
      Drop it!
    </div>
  );
};

export { FileDrop as default };
