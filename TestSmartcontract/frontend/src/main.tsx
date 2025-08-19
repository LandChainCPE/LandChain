import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './02-เทสข้อมูลแล้วถูกต้อง-ใช้SmartContractได้App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
