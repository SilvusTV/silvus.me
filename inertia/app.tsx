import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import '../resources/css/app.css'

createInertiaApp({
  title: () => 'SILVUS.ME',
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true })
    return pages[`./pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    document.title = 'SILVUS.ME'
    createRoot(el).render(<App {...props} />)
  }
})
