import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'
import inertia from '@adonisjs/inertia/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    inertia({ ssr: { enabled: false } }),
    adonisjs({ entrypoints: ['inertia/app.tsx'] }),
    react()
  ]
})
