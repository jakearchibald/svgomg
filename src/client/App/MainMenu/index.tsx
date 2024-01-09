import { FunctionComponent } from 'preact';
import { version as svgoVersion } from 'svgo/package.json';

import * as styles from './styles.module.css';
import useIsClient from '../../hooks/useIsClient';

const logo = `<svg viewBox="0 0 600 600"><path fill="#0097a7" d="M0 1.995h600V600H0z"/><path fill="#00bcd4" d="M0 0h600v395.68H0z"/><path d="M269.224 530.33 519 395.485H269.224V530.33zM214.35 91.847H519v303.638H214.35V91.847z" opacity=".22"/><path fill="#fff" d="M80 341.735h189.224V530.33H80z"/></svg>
`;

interface Props {}

const MainMenu: FunctionComponent<Props> = ({}) => {
  const isClient = useIsClient();

  return (
    <div class={styles.mainMenu}>
      <div class={styles.overlay}></div>
      <nav class={styles.menu}>
        <div class={styles.appTitle}>
          <div class={styles.logo} dangerouslySetInnerHTML={{ __html: logo }} />
          <div class={styles.titleText}>
            <h1>SVGOMG</h1>
            <p>
              Powered by{' '}
              <a href="https://github.com/svg/svgo">SVGO v{svgoVersion}</a>
            </p>
          </div>
        </div>
        {/*<ul>
            <li>
              <button class="load-file unbutton menu-item" type="button">
                {% include "partials/icons/open.svg" %}
                <span class="menu-item-text">Open SVG</span>
              </button>
              <input type="file" class="load-file-input" accept=".svg">
            </li>
            <li>
              <label class="menu-input menu-item">
                {% include "partials/icons/paste.svg" %}
                <span class="input-area">
                  <textarea class="paste-input"></textarea>
                  <span class="label-txt">Paste markup</span>
                </span>
              </label>
            </li>
            <li>
              <button class="load-demo unbutton menu-item" type="button">
                {% include "partials/icons/demo.svg" %}
                <span class="menu-item-text">Demo</span>
              </button>
            </li>
            <li>
              <a href="https://github.com/jakearchibald/svgomg" class="menu-item">
                {% include "partials/icons/contribute.svg" %}
                <span class="menu-item-text">Contribute</span>
              </a>
            </li>
          </ul>
  <div class="menu-extra"></div>*/}
      </nav>
    </div>
  );
};

export { MainMenu as default };
