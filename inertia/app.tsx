import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import '../resources/css/app.css'

createInertiaApp({
  title: (title) => (title ? `SILVUS.ME | ${title}` : 'SILVUS.ME'),
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true })
    return pages[`./pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
