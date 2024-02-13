import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import { Signal } from '@preact/signals';

import * as styles from './styles.module.css';
import { OptimizeConfig } from '../types';
import pluginData from 'virtual:svgo-plugin-data';
import CheckboxRow from './CheckboxRow';

interface Props {
  showOriginal: Signal<boolean>;
  optimizeConfig: OptimizeConfig;
}

const Config: FunctionComponent<Props> = ({ optimizeConfig, showOriginal }) => {
  return (
    <div class={styles.config}>
      <div class={styles.configScroller}>
        <form>
          <CheckboxRow text="Show Original" checked={showOriginal} />
          {Object.entries(optimizeConfig.plugins).map(([name, settings]) => (
            <CheckboxRow
              text={pluginData[name].title}
              checked={settings.enabled}
            />
          ))}
          <CheckboxRow text="Pretty" checked={optimizeConfig.pretty.enabled} />
        </form>
      </div>
    </div>
  );
};

export { Config as default };
