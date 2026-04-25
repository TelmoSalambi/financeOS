import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('%c🚀 FINANCE OS: INICIALIZANDO...', 'color: #10B981; font-weight: bold; font-size: 20px;');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
