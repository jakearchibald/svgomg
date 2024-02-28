import wasmURL from './brotli-wasm/brotli_wasm_bg.wasm?url';
import init, { compress } from './brotli-wasm/brotli_wasm';
import exposeWorkerActions from '../../utils/exposeWorkerActions';

await init(wasmURL);
const textEncoder = new TextEncoder();

exposeWorkerActions({
  compress: ({ source }: { source: string }): number => {
    const bytes = textEncoder.encode(source);
    return compress(bytes).length;
  },
});
