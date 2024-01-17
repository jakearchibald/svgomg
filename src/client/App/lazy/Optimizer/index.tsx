import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import {} from '@preact/signals';
import { Input } from '../..';

//import * as styles from './styles.module.css';

interface Props {
  input: Input;
}

const Optimizer: FunctionComponent<Props> = ({ input }) => {
  return (
    <div>
      <p>Optimizer</p>
      <div dangerouslySetInnerHTML={{ __html: input.body }} />
    </div>
  );
};

export { Optimizer as default };
