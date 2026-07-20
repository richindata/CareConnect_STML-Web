import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'
import { AnnouncerProvider } from './context/AnnouncerProvider'
import { AuthProvider } from './context/AuthProvider'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root was not found in index.html')

createRoot(container).render(
  <StrictMode>
    <AnnouncerProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AnnouncerProvider>
  </StrictMode>,
)
