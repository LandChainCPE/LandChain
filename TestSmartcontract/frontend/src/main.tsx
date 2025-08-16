import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './05ใส่UIเต็มที่App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
