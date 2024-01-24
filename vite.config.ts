import { createRequire } from 'module';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    preact({
      babel: {
        // Change cwd to load Preact Babel plugins
        cwd: createRequire(import.meta.url).resolve('@preact/preset-vite'),
      },
    }),
  ],
  base: '/svgomg/',
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
    ssrEmitAssets: true,
    //minify: false,
  },
}));
