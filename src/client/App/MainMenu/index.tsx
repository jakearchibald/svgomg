import { FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';
import { Signal, useComputed, useSignal } from '@preact/signals';
import { version as svgoVersion } from 'svgo/package.json';

import * as styles from './styles.module.css';
import useClientJSReady from '../../hooks/useClientJSReady';

const logoSVG = `<svg viewBox="0 0 600 600"><path fill="#0097a7" d="M0 1.995h600V600H0z"/><path fill="#00bcd4" d="M0 0h600v395.68H0z"/><path d="M269.224 530.33 519 395.485H269.224V530.33zM214.35 91.847H519v303.638H214.35V91.847z" opacity=".22"/><path fill="#fff" d="M80 341.735h189.224V530.33H80z"/></svg>
`;
const openSVG = `<svg class="icon" viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>`;
const pasteSVG = `<svg class="icon" viewBox="0 0 24 24"><path d="M19 2h-4.2C14.4.8 13.3 0 12 0c-1.3 0-2.4.8-2.8 2H5C4 2 3 3 3 4v16c0 1 1 2 2 2h14c1 0 2-1 2-2V4c0-1-1-2-2-2zm-7 0c.6 0 1 .5 1 1s-.5 1-1 1-1-.5-1-1 .5-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/></svg>`;
const demoSVG = `<svg class="icon" viewBox="0 0 24 24"><path d="M18.92 6c-.2-.58-.76-1-1.42-1h-11c-.66 0-1.2.42-1.42 1L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-6zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`;
const contributeSVG = `<svg class="icon" viewBox="0 0 512 512"><path d="M7 266.8c22.6-5.7 53.3-13.4 107-14.8-1.4-3-2.8-6-4-9.2-21-.2-85.4 2.8-107.5 8.2H2c-.6 0-1.3-.4-1.5-1.2-.2-1 .4-1.8 1.3-2 21.8-5.4 84.8-8.4 107-8.3-5-14.8-7.2-31.7-7.2-50.6 0-33.6 10.5-46.2 24.5-64-10.6-38.3 4-64.4 4-64.4s22.5-4.7 65 25.8c23.2-9.8 84.7-10.7 113.8-2.2 18-11.8 50.6-28.5 63.8-23.8 3.6 5.7 11.3 22.5 4.7 59.3 4.5 8 27.7 25.3 27.8 74-.2 18-2 33-5.6 45.8 55.6-.4 88.2 4 110.8 8.3.8.2 1.4 1 1.3 2-.2.7-1 1.3-1.6 1.3h-.5c-22.4-4-55.2-8.7-111-8.2-1 3.3-2 6.4-3.3 9.3 19 .7 71.2 2.8 113.8 15.8 1 .3 1.4 1.2 1 2 0 .8-.7 1.2-1.4 1.2h-.5c-43-13.2-96.5-15-114.2-15.6-15.4 34-47 46.6-98.3 51.8 16.6 10.5 21.3 23.6 21.3 59 0 35.5-.5 40.2-.3 48.4 0 13.4 19.7 19.8 19 24-.7 4.4-16.4 3.7-23.7 1-20.8-7-18.7-24.4-18.7-24.4l-.6-47.4s1.4-25.5-8-25.5V420c0 16.8 11.8 22 11.8 28 0 10.8-21.6-1-28.2-7.6-10-10-9-31.7-8.7-48.8.2-16.4-.2-52.5-.2-52.5l-6.8.3s3 78.7-3.6 93c-8.3 18.4-33.5 24.8-33.5 16.4 0-5.7 6.3-4 9.8-16.5 3-10.8 2-91 2-91s-8.2 4.8-8.2 19.8l-.2 57.8c0 14.8-20.8 23-31 23-5 0-11.3 0-11.3-2.8 0-6.8 19.2-10.8 19.2-25l-.3-43.8s-9.7 1.7-23.4 1.7c-34.6 0-45.6-22.2-50.8-34.6-6.8-16-15.6-23.7-25-29.7-5.7-3.7-7-8-.4-9.4 30.7-5.7 38.5 34.8 59 41.3 14.6 4.6 33.4 2.6 42.7-3.5 1.4-12.3 10.3-23 17.7-28.6-52-5-83-23-99-52-54.4 1.2-85.3 9-108 14.6L3 271.2h-.4c-.8 0-1.5-.5-1.6-1.2-.3-1 .3-1.8 1.2-2l4.8-1.2z"/></svg>
`;

interface Props {
  show: Signal<boolean>;
  onOpenSVG: (data: string, filename: string) => void;
}

const MainMenu: FunctionComponent<Props> = ({ show, onOpenSVG }) => {
  const menuElRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteInputRef = useRef<HTMLTextAreaElement>(null);
  const clientJSReady = useClientJSReady();
  const pasteInputValue = useSignal('');

  const mainMenuClassName = useComputed(() => {
    const classNames = [styles.mainMenu];
    if (!show.value) classNames.push(styles.hidden);

    return classNames.join(' ');
  });

  const onOpenSVGClick = () => {
    fileInputRef.current!.click();
  };

  const onFileInputChange = () => {
    const file = fileInputRef.current!.files?.[0];
    if (!file) return;

    file.text().then((data) => {
      onOpenSVG(data, file.name);
    });
  };

  const onPasteInput = () => {
    pasteInputValue.value = pasteInputRef.current!.value;

    if (!pasteInputValue.value.includes('</svg>')) return;

    onOpenSVG(pasteInputValue.value, 'image.svg');
    pasteInputValue.value = '';
  };

  return (
    <div class={mainMenuClassName}>
      <div class={styles.overlay}></div>
      <nav ref={menuElRef} class={styles.menu} tabIndex={0}>
        <div class={styles.appTitle}>
          <div
            class={styles.logo}
            dangerouslySetInnerHTML={{ __html: logoSVG }}
          />
          <div class={styles.titleText}>
            <h1>SVGOMG</h1>
            <p>
              Powered by{' '}
              <a href="https://github.com/svg/svgo">SVGO v{svgoVersion}</a>
            </p>
          </div>
        </div>
        {clientJSReady.value && (
          <ul class={styles.menuList}>
            <li>
              <button
                onClick={onOpenSVGClick}
                class={styles.menuItem}
                type="button"
              >
                <div
                  class={styles.menuLogo}
                  dangerouslySetInnerHTML={{ __html: openSVG }}
                />
                <span class={styles.menuItemText}>Open SVG</span>
              </button>
              <input
                ref={fileInputRef}
                onChange={onFileInputChange}
                type="file"
                class={styles.loadFileInput}
                accept=".svg"
              />
            </li>
            <li>
              <label class={styles.menuInput}>
                <div
                  class={styles.menuLogo}
                  dangerouslySetInnerHTML={{ __html: pasteSVG }}
                />
                <span class={styles.inputArea}>
                  <textarea
                    ref={pasteInputRef}
                    class={styles.pasteInput}
                    onInput={onPasteInput}
                    value={pasteInputValue}
                  ></textarea>
                  <span class={styles.labelText}>Paste markup</span>
                </span>
              </label>
            </li>
            <li>
              <button class={styles.menuItem} type="button">
                <div
                  class={styles.menuLogo}
                  dangerouslySetInnerHTML={{ __html: demoSVG }}
                />
                <span class={styles.menuItemText}>Demo</span>
              </button>
            </li>
            <li>
              <a
                href="https://github.com/jakearchibald/svgomg"
                class={styles.menuItem}
                target="_blank"
              >
                <div
                  class={styles.menuLogo}
                  dangerouslySetInnerHTML={{ __html: contributeSVG }}
                />
                <span class={styles.menuItemText}>Contribute</span>
              </a>
            </li>
          </ul>
        )}
      </nav>
    </div>
  );
};

export { MainMenu as default };
