import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import { Signal } from '@preact/signals';

import * as styles from './styles.module.css';
import { PluginConfig } from '../types';
import pluginData from 'virtual:svgo-plugin-data';
import CheckboxRow from './CheckboxRow';

interface Props {
  showOriginal: Signal<boolean>;
  pluginConfig: PluginConfig;
}

const Config: FunctionComponent<Props> = ({ pluginConfig, showOriginal }) => {
  return (
    <div class={styles.config}>
      <form>
        <CheckboxRow text="Show Original" checked={showOriginal} />
        {Object.entries(pluginConfig).map(([name, settings]) => (
          <CheckboxRow
            text={pluginData[name].title}
            checked={settings.enabled}
          />
        ))}
      </form>
    </div>
  );
};

export { Config as default };
