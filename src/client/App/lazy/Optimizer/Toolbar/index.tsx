import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import {} from '@preact/signals';

import * as styles from './styles.module.css';

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
      <form class="material-tabs view-toggler">
        <label class="material-tab">
          <input type="radio" name="output" value="image" checked />
          <span class="selected"></span>
          Image
        </label>
        <label class="material-tab">
          <input type="radio" name="output" value="code" />
          <span class="selected"></span>
          Markup
        </label>
      </form>
    </div>
  );
};

export { Toolbar as default };
