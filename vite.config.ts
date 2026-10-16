import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' lets the built site live in any folder or subpath of a host
// three.js alone is ~600 KB minified, so raise the warning limit instead of splitting one page
export default defineConfig({ plugins: [react()], base: './', build: { chunkSizeWarningLimit: 900 } })
