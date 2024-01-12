import { FunctionComponent } from 'preact';
import { useSignal } from '@preact/signals';

import MainMenu from './MainMenu';

interface Props {}

const App: FunctionComponent<Props> = ({}) => {
  const showMenu = useSignal(true);
  const showMenuSpinner = useSignal(false);

  // TODO: Make rest of app inert when showMenu is true

  function onOpenSVG(data: string | Blob | URL, filename: string) {
    showMenuSpinner.value = true;
    // TODO: load the SVG, then hide the spinner and hide the menu
    console.log('open svg', data, filename);
  }

  function onMenuHideIntent() {
    // TODO: ignore if no SVG loaded
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
      <p>Hello</p>
    </div>
  );
};

export { App as default };
