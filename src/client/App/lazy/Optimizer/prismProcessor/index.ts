import CallableWorker from '../utils/CallableWorker';
import workerURL from './worker?worker&url';

const callableWorker = new CallableWorker(workerURL, {
  name: 'Prism',
  type: 'module',
});

export function highlight(
  source: string,
  { signal = new AbortController().signal } = {},
) {
  return callableWorker.call<string>('highlight', { source }, { signal });
}
