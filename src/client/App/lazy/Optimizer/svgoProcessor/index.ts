import doAbortable from '../../../../utils/doAbortable';
import workerURL from './worker?worker&url';

let worker: Worker;

function cycleWorker() {
  if (worker) {
    worker.terminate();
  }

  if (import.meta.env.SSR) return;

  worker = new Worker(workerURL, { name: 'SVGO', type: 'module' });
}

cycleWorker();

function abortableWorkerFunction<R>(
  signal: AbortSignal,
  callback: () => R | Promise<R>,
): Promise<R> {
  return doAbortable(signal, (setAbortAction) => {
    setAbortAction(() => cycleWorker());
    return callback();
  });
}

function workerCall<R>(
  signal: AbortSignal,
  action: string,
  args: { [key: string]: any } = {},
): Promise<R> {
  return abortableWorkerFunction(signal, () => {
    const { port1, port2 } = new MessageChannel();

    worker.postMessage(
      {
        action,
        returnPort: port2,
        ...args,
      },
      [port2],
    );

    return new Promise<R>((resolve, reject) => {
      const done = () => port1.close();

      port1.addEventListener('message', (event) => {
        if (event.data.action === 'done') {
          done();
          resolve(event.data.result);
          return;
        }
        if (event.data.action === 'error') {
          done();
          reject(Error(event.data.message));
          return;
        }
      });

      port1.start();
    });
  });
}

export function ready() {
  return workerCall<string>(new AbortController().signal, 'ready');
}

export function getDimensions(signal: AbortSignal, source: string) {
  return workerCall<{ width: number; height: number }>(
    signal,
    'getDimensions',
    { source },
  );
}
