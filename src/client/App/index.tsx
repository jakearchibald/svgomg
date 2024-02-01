import { FunctionComponent } from 'preact';
import { useComputed, useSignal } from '@preact/signals';

import MainMenu from './MainMenu';
import FileDrop from './FileDrop';
import useLazyComponent from '../hooks/useLazyComponent';
import CheckeredBG from './CheckeredBG';

const optimizerPromise = import('./lazy').then((module) => module.Optimizer);
const svgoWorkerReady = import.meta.env.SSR
  ? Promise.resolve()
  : import('./lazy').then((module) => module.svgoWorkerReady());

const mainAppReady = Promise.all([optimizerPromise, svgoWorkerReady]);

async function loadSVGBody(
  signal: AbortSignal,
  svgInput: Blob | string | URL,
): Promise<string> {
  signal.throwIfAborted();

  if (typeof svgInput === 'string') return svgInput;

  if (svgInput instanceof Blob) {
    const text = await svgInput.text();
    signal.throwIfAborted();
    return text;
  }

  // svgInput instanceof URL:
  const response = await fetch(svgInput, { signal });
  if (!response.ok) throw new Error(`Failed to fetch ${svgInput}`);
  return response.text();
}

interface Props {}

export interface Input {
  body: string;
  filename: string;
}

const App: FunctionComponent<Props> = ({}) => {
  // Model
  const input = useSignal<Input | null>(null);
  const currentOpenController = useSignal<AbortController | null>(null);

  // View
  const darkBG = useSignal(false);
  const showMenu = useSignal(true);
  const showMenuSpinner = useSignal(false);
  const appInert = useComputed(() => showMenu.value);
  const Optimizer = useLazyComponent(optimizerPromise);

  async function onOpenSVG(data: string | Blob | URL, filename: string) {
    currentOpenController.value?.abort();

    const controller = new AbortController();
    const { signal } = controller;

    currentOpenController.value = controller;

    showMenuSpinner.value = true;

    try {
      const newInput = {
        body: await loadSVGBody(signal, data),
        filename,
      };

      await mainAppReady;

      signal.throwIfAborted();

      input.value = newInput;
      showMenu.value = false;
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      // TODO:
      console.error(err);
    } finally {
      showMenuSpinner.value = false;
    }
  }

  function onMenuHideIntent() {
    if (!input.value) return;
    showMenu.value = false;
  }

  function onDrop(file: File) {
    onOpenSVG(file, file.name);
  }

  function onMenuClick() {
    showMenu.value = true;
  }

  return (
    <>
      <CheckeredBG dark={darkBG} />
      {Optimizer && input.value && (
        <Optimizer
          inert={appInert}
          input={input.value}
          onMenuClick={onMenuClick}
        />
      )}
      <MainMenu
        show={showMenu}
        showSpinner={showMenuSpinner}
        onOpenSVG={onOpenSVG}
        onHideIntent={onMenuHideIntent}
      />
      <FileDrop onDrop={onDrop} />
    </>
  );
};

export { App as default };
