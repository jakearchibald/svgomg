import CallableWorker from '../utils/CallableWorker';
import workerURL from './worker?worker&url';

const callableWorker = new CallableWorker(workerURL, {
  name: 'Brotli',
  type: 'module',
});

export function compress(
  source: string,
  { signal = new AbortController().signal } = {},
) {
  return callableWorker.call<number>('compress', { source }, { signal });
}
