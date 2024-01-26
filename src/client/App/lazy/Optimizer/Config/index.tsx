import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import {} from '@preact/signals';

import * as styles from './styles.module.css';

interface Props {}

const Config: FunctionComponent<Props> = ({}) => {
  return <div class={styles.config}></div>;
};

export { Config as default };
