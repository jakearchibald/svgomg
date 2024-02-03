import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import { Signal, useComputed } from '@preact/signals';

import * as styles from './styles.module.css';
import { RenderableSVG } from '../types';

interface Props {
  svg: Signal<RenderableSVG>;
}

const SVGRenderer: FunctionComponent<Props> = ({ svg }) => {
  const ceilWidth = useComputed(() => Math.ceil(svg.value.width));
  const ceilHeight = useComputed(() => Math.ceil(svg.value.height));
  const docSource = useComputed(
    () =>
      '<!DOCTYPE html><style>body{margin:0;}svg{display:block}</style>' +
      svg.value.source,
  );

  return (
    <iframe
      class={styles.iframe}
      width={ceilWidth}
      height={ceilHeight}
      srcDoc={docSource}
      sandbox="allow-scripts"
    />
  );
};

export { SVGRenderer as default };
