import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import { Signal } from '@preact/signals';

//import * as styles from './styles.module.css';

interface Props {
  text: string;
  checked: Signal<boolean>;
}

const CheckboxRow: FunctionComponent<Props> = ({ text, checked }) => {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => (checked.value = event.currentTarget.checked)}
        />{' '}
        {text}
      </label>
    </div>
  );
};

export { CheckboxRow as default };
