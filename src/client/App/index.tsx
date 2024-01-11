import { FunctionComponent } from 'preact';
import { useSignal } from '@preact/signals';

import MainMenu from './MainMenu';

interface Props {}

const App: FunctionComponent<Props> = ({}) => {
  const showMenu = useSignal(true);

  // TODO: Make rest of app inert when showMenu is true

  function onOpenSVG(data: string, filename: string) {
    console.log('open svg', data, filename);
  }

  return (
    <div>
      <MainMenu show={showMenu} onOpenSVG={onOpenSVG} />
      <p>Hello</p>
    </div>
  );
};

export { App as default };
