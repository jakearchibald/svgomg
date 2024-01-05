import { FunctionComponent } from 'preact';
import { version as svgoVersion } from 'svgo/package.json';

import * as styles from './styles.module.css';

interface Props {}

const MainMenu: FunctionComponent<Props> = ({}) => {
  return (
    <div class={styles.mainMenu}>
      <div class={styles.overlay}></div>
      <div class={styles.menu}>
        <div class={styles.appTitle}>
          <svg class={styles.logo} viewBox="0 0 600 600">
            <path fill="#0097a7" d="M0 1.995h600V600H0z" />
            <path fill="#00bcd4" d="M0 0h600v395.68H0z" />
            <path
              d="M269.224 530.33 519 395.485H269.224V530.33zM214.35 91.847H519v303.638H214.35V91.847z"
              opacity=".22"
            />
            <path fill="#fff" d="M80 341.735h189.224V530.33H80z" />
          </svg>
          <div class={styles.titleText}>
            <h1>SVGOMG</h1>
            <p>
              Powered by{' '}
              <a href="https://github.com/svg/svgo">SVGO v{svgoVersion}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MainMenu as default };
