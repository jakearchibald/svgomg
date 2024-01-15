import { FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';
import { Signal, useComputed, useSignal } from '@preact/signals';
import { version as svgoVersion } from 'svgo/package.json';

import * as styles from './styles.module.css';
import useClientJSReady from '../../hooks/useClientJSReady';
import Spinner from '../Spinner';
import demoImageURL from '../../imgs/car-demo.svg';
import MenuRow from './MenuRow';
import MenuIcon, {
  contributeIcon,
  demoIcon,
  openIcon,
  pasteIcon,
} from './MenuIcon';

const logoSVG = `<svg viewBox="0 0 600 600"><path fill="#0097a7" d="M0 1.995h600V600H0z"/><path fill="#00bcd4" d="M0 0h600v395.68H0z"/><path d="M269.224 530.33 519 395.485H269.224V530.33zM214.35 91.847H519v303.638H214.35V91.847z" opacity=".22"/><path fill="#fff" d="M80 341.735h189.224V530.33H80z"/></svg>
`;

interface Props {
  show: Signal<boolean>;
  showSpinner: Signal<boolean>;
  onOpenSVG: (data: string | Blob | URL, filename: string) => void;
  onHideIntent: () => void;
}

const enum SpinnerPosition {
  Open,
  Paste,
  Demo,
}

const MainMenu: FunctionComponent<Props> = ({
  show,
  onOpenSVG,
  showSpinner,
  onHideIntent,
}) => {
  const menuElRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteInputRef = useRef<HTMLTextAreaElement>(null);
  const clientJSReady = useClientJSReady();
  const pasteInputValue = useSignal('');
  const spinnerPosition = useSignal<SpinnerPosition>(SpinnerPosition.Open);
  const menuInert = useComputed(() => !show.value);

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

    spinnerPosition.value = SpinnerPosition.Open;

    onOpenSVG(file, file.name);
  };

  const onPasteInput = () => {
    pasteInputValue.value = pasteInputRef.current!.value;

    if (!pasteInputValue.value.includes('</svg>')) return;

    spinnerPosition.value = SpinnerPosition.Paste;

    onOpenSVG(pasteInputValue.value, 'image.svg');
    pasteInputValue.value = '';
  };

  const onDemoClick = () => {
    spinnerPosition.value = SpinnerPosition.Demo;
    onOpenSVG(new URL(demoImageURL, location.href), 'demo.svg');
  };

  return (
    <div class={mainMenuClassName} inert={menuInert}>
      <div onClick={() => onHideIntent()} class={styles.overlay}></div>
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
            <MenuRow>
              <button
                onClick={onOpenSVGClick}
                class={styles.menuItem}
                type="button"
              >
                <MenuIcon icon={openIcon} />
                <span class={styles.menuItemText}>Open SVG</span>
                {spinnerPosition.value === SpinnerPosition.Open && (
                  <Spinner show={showSpinner} />
                )}
              </button>
              <input
                ref={fileInputRef}
                onChange={onFileInputChange}
                type="file"
                class={styles.loadFileInput}
                accept=".svg"
              />
            </MenuRow>
            <MenuRow>
              <label class={styles.menuInput}>
                <MenuIcon icon={pasteIcon} />
                <span class={styles.inputArea}>
                  <textarea
                    ref={pasteInputRef}
                    class={styles.pasteInput}
                    onInput={onPasteInput}
                    value={pasteInputValue}
                  ></textarea>
                  <span class={styles.labelText}>Paste markup</span>
                </span>
                {spinnerPosition.value === SpinnerPosition.Paste && (
                  <Spinner show={showSpinner} />
                )}
              </label>
            </MenuRow>
            <MenuRow>
              <button
                onClick={onDemoClick}
                class={styles.menuItem}
                type="button"
              >
                <MenuIcon icon={demoIcon} />
                <span class={styles.menuItemText}>Demo</span>
                {spinnerPosition.value === SpinnerPosition.Demo && (
                  <Spinner show={showSpinner} />
                )}
              </button>
            </MenuRow>
            <MenuRow>
              <a
                href="https://github.com/jakearchibald/svgomg"
                class={styles.menuItem}
                target="_blank"
              >
                <MenuIcon icon={contributeIcon} />
                <span class={styles.menuItemText}>Contribute</span>
              </a>
            </MenuRow>
          </ul>
        )}
        <div />
      </nav>
    </div>
  );
};

export { MainMenu as default };
