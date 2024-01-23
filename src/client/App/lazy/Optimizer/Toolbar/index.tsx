import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import {} from '@preact/signals';

import * as styles from './styles.module.css';
import Rippler from '../../../Rippler';

interface Props<T extends readonly string[]> {
  tabNames: T;
  activeTab: T[number];
  onTabChange?: (tab: T[number]) => void;
  onMenuClick?: () => void;
}

const menuSVG = `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>`;

const Toolbar = <T extends readonly string[]>({
  tabNames,
  activeTab,
  onTabChange,
  onMenuClick,
}: Props<T>) => {
  return (
    <div class={styles.toolbar}>
      <button
        class={styles.menuBtn}
        type="button"
        title="Menu"
        dangerouslySetInnerHTML={{ __html: menuSVG }}
        onClick={() => onMenuClick?.()}
      />
      <form class={styles.tabs}>
        {tabNames.map((tabName) => (
          <Rippler>
            <label
              class={[styles.tab, tabName === activeTab && styles.selected]
                .filter(Boolean)
                .join(' ')}
            >
              <input
                class={styles.tab}
                type="radio"
                name="tab"
                value={tabName}
                checked={tabName === activeTab}
                onInput={() => onTabChange?.(tabName)}
              />
              <span class={styles.tabText}>{tabName}</span>
            </label>
          </Rippler>
        ))}
      </form>
    </div>
  );
};

export { Toolbar as default };
