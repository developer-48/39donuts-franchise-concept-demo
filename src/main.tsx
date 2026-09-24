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
// Keep this order: G overrides F, which overrides the preserved E design.
import './styles/global.css'
import './styles/variant-e.css'
import './styles/variant-f.css'
import './styles/variant-g.css'
import './styles/donut-scrollbar.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
