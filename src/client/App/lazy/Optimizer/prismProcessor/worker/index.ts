import './setGlobalOption';
import { highlight, languages } from 'prismjs';
import exposeWorkerActions from '../../utils/exposeWorkerActions';

exposeWorkerActions({
  highlight: ({ source }: { source: string }): string => {
    return highlight(source, languages.markup, 'markup');
  },
});
