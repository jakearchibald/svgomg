import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';

import * as styles from './styles.module.css';
import { PluginConfig } from '../types';
import pluginData from 'virtual:svgo-plugin-data';

interface Props {
  pluginConfig: PluginConfig;
}

const Config: FunctionComponent<Props> = ({ pluginConfig }) => {
  return (
    <div class={styles.config}>
      <form>
        {Object.entries(pluginConfig).map(([name, settings]) => (
          <div>
            <label>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(event) =>
                  (settings.enabled.value = event.currentTarget.checked)
                }
              />{' '}
              {pluginData[name].title}
            </label>
          </div>
        ))}
      </form>
    </div>
  );
};

export { Config as default };
