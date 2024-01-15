import { FunctionComponent } from 'preact';

import Rippler from '../Rippler';

const MenuRow: FunctionComponent<{}> = ({ children }) => {
  return (
    <li>
      <Rippler>{children}</Rippler>
    </li>
  );
};

export { MenuRow as default };
