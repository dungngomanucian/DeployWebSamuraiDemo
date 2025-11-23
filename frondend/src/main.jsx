import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import { PrimeReactProvider } from 'primereact/api';
import { AdminAuthProvider } from './context/AdminAuthContext';
import "primereact/resources/themes/lara-light-indigo/theme.css"; 
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";  

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminAuthProvider>
      <PrimeReactProvider>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
      </PrimeReactProvider>
    </AdminAuthProvider>
  </StrictMode>,
)