import { FunctionComponent } from 'preact';
import { useComputed, useSignal } from '@preact/signals';

import MainMenu from './MainMenu';

interface Props {}

export interface Input {
  body: string;
  filename: string;
}

const App: FunctionComponent<Props> = ({}) => {
  // Model
  const input = useSignal<Input | null>(null);

  // View
  const showMenu = useSignal(true);
  const showMenuSpinner = useSignal(false);
  const appInert = useComputed(() => !showMenu.value);

  function onOpenSVG(data: string | Blob | URL, filename: string) {
    showMenuSpinner.value = true;

    if (typeof data === 'string') {
      input.value = {
        body: data,
        filename,
      };
      return;
    }

    if (data instanceof Blob) {
      data.text().then((body) => {
        input.value = {
          body,
          filename,
        };
      });
      return;
    }

    if (data instanceof URL) {
      fetch(data).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${data}`);
        }

        const body = await response.text();

        input.value = {
          body,
          filename,
        };
      });
      return;
    }
  }

  function onMenuHideIntent() {
    if (!input.value) return;
    showMenu.value = false;
  }

  return (
    <div>
      <MainMenu
        show={showMenu}
        showSpinner={showMenuSpinner}
        onOpenSVG={onOpenSVG}
        onHideIntent={onMenuHideIntent}
      />
      <div inert={appInert}></div>
    </div>
  );
};

export { App as default };
