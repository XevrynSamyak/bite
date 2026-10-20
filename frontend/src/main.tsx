import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AuthPage from './AuthPage'
import './styles.css'

// The last part of the URL picks the page: /login, /register, anything else is the landing page
const path = location.pathname.split('/').pop()
const page = path === 'login' || path === 'register' ? <AuthPage mode={path} /> : <App />

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>)
