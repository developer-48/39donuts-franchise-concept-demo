import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/nunito/cyrillic-900.css'
import '@fontsource/nunito/latin-900.css'
import '@fontsource/unbounded/500.css'
import '@fontsource/unbounded/600.css'
// Keep the cascade order: foundation, refinements, interactions.
import './styles/global.css'
import './styles/site-foundation.css'
import './styles/site-refinements.css'
import './styles/site-interactions.css'
import './styles/donut-scrollbar.css'
import App from './App'

const relativePath = window.location.pathname.slice(import.meta.env.BASE_URL.length).replace(/^\/+|\/+$/g, '')

if (/^(e|f|g)$/.test(relativePath)) {
  window.location.replace(`${import.meta.env.BASE_URL}${window.location.search}${window.location.hash}`)
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
