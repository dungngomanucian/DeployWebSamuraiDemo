import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import { AdminAuthProvider } from './context/AdminAuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminAuthProvider>
      <App />
      <Toaster position="top-right" reverseOrder={false} />
    </AdminAuthProvider>
  </StrictMode>,
)