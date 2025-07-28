import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 55034,
        host: true
    },
    define: {
        global: 'globalThis',
    },
    resolve: {
        alias: {
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            util: 'util'
        }
    }
})