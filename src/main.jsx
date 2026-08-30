import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles.css'
import { AppProvider, useApp } from './context/AppContext'
import { Layout } from './components/Layout'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Property } from './pages/Property'
import { Maintenance } from './pages/Maintenance'
import { Amenities } from './pages/Amenities'
import { Bookings } from './pages/Bookings'
import { Profile } from './pages/Profile'
import { Manager } from './pages/Manager'

function Protected({ children }) {
  const { user } = useApp()
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<Protected><Layout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="property" element={<Property />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="amenities" element={<Amenities />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="manager" element={<Manager />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
