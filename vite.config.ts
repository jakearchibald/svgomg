import { createRequire } from 'module'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact({
      babel: {
        // Change cwd to load Preact Babel plugins
        cwd: createRequire(import.meta.url).resolve('@preact/preset-vite')
      }
    })
  ]
})
