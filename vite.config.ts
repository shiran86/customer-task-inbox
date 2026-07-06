import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^~(.+)/, replacement: path.resolve(__dirname, 'node_modules/$1') },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        importers: [
          {
            findFileUrl(url: string) {
              if (url.startsWith('~')) {
                const resolved = path.resolve(__dirname, 'node_modules', url.substring(1))
                return pathToFileURL(resolved)
              }
              return null
            },
          },
        ],
      },
    },
  },
})
