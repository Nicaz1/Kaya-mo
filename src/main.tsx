import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { NavigationProvider } from './state/navigation.tsx'
import { AppProvider } from './state/store.tsx'
import { ToastProvider } from './state/toast.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <ToastProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </ToastProvider>
    </AppProvider>
  </StrictMode>,
)
