import doAbortable from './doAbortable';

type WorkerParams = ConstructorParameters<typeof Worker>;

export default class CallableWorker {
  #workerArgs: WorkerParams;
  #worker: Worker | undefined;

  #cycle() {
    if (this.#worker) this.#worker.terminate();
    if (import.meta.env.SSR) return;

    this.#worker = new Worker(...this.#workerArgs);
  }

  #abortableWorkerFunction<R>(
    signal: AbortSignal,
    callback: () => R | Promise<R>,
  ): Promise<R> {
    return doAbortable(signal, (setAbortAction) => {
      setAbortAction(() => this.#cycle());
      return callback();
    });
  }

  call<R>(
    action: string,
    args: { [key: string]: any } = {},
    { signal = new AbortController().signal } = {},
  ) {
    return this.#abortableWorkerFunction(signal, () => {
      const { port1, port2 } = new MessageChannel();

      this.#worker!.postMessage(
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

  constructor(...args: WorkerParams) {
    this.#workerArgs = args;
    this.#cycle();
  }
}
