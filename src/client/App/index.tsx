import { FunctionComponent } from 'preact';
import MainMenu from './MainMenu';

interface Props {}

const App: FunctionComponent<Props> = ({}) => {
  return (
    <div>
      <MainMenu />
      <p>Hello</p>
    </div>
  );
};

export { App as default };
