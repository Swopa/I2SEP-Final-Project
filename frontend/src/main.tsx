import ReactDOM from  'react-dom/client'
import React from 'react'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { BrowserRouter } from 'react-router-dom'



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
       <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
