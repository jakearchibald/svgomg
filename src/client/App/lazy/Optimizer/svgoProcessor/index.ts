import CallableWorker from '../utils/CallableWorker';
import workerURL from './worker?worker&url';

const callableWorker = new CallableWorker(workerURL, {
  name: 'SVGO',
  type: 'module',
});

export function ready() {
  return callableWorker.call<string>('ready');
}

export function getDimensions(
  source: string,
  { signal = new AbortController().signal } = {},
) {
  return callableWorker.call<{ width: number; height: number }>(
    'getDimensions',
    { source },
    { signal },
  );
}

export function compress(
  source: string,
  { signal = new AbortController().signal } = {},
) {
  return callableWorker.call<string>('compress', { source }, { signal });
}
