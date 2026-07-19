import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'
import { AnnouncerProvider } from './context/AnnouncerProvider'
import { PreferencesProvider } from './context/PreferencesProvider'
import { AppDataProvider } from './context/AppDataProvider'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root was not found in index.html')

createRoot(container).render(
  <StrictMode>
    <PreferencesProvider>
      <AnnouncerProvider>
        <AppDataProvider>
          <RouterProvider router={router} />
        </AppDataProvider>
      </AnnouncerProvider>
    </PreferencesProvider>
  </StrictMode>,
)
