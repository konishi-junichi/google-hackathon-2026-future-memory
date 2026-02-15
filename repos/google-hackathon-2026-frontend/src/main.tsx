import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { TravelProvider } from './context/TravelContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TravelProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </TravelProvider>
  </StrictMode>,
)
