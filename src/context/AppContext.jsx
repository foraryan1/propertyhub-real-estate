import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AppContext = createContext(null)

const seedRequests = [
  { id: 'MT-1024', title: 'AC not cooling', location: 'Living room', status: 'In Progress', created: '30 Aug 2026', priority: 'High', description: 'The air conditioner is running but not cooling the room.' },
  { id: 'MT-1021', title: 'Water leakage', location: 'Kitchen sink', status: 'Pending', created: '29 Aug 2026', priority: 'Medium', description: 'Small water leak underneath the kitchen sink.' },
  { id: 'MT-1018', title: 'Light replacement', location: 'Master bedroom', status: 'Completed', created: '27 Aug 2026', priority: 'Low', description: 'Ceiling light stopped working.' },
  { id: 'MT-1012', title: 'Door lock repair', location: 'Main entrance', status: 'Pending', created: '25 Aug 2026', priority: 'High', description: 'Main door lock is becoming difficult to turn.' }
]

const seedBookings = [
  { id: 'BK-204', amenity: 'Swimming Pool', date: '31 Aug 2026', start: '10:00 AM', end: '11:00 AM', status: 'Confirmed' },
  { id: 'BK-201', amenity: 'Community Hall', date: '02 Sep 2026', start: '05:00 PM', end: '07:00 PM', status: 'Confirmed' }
]

const amenities = [
  { id: 1, name: 'Swimming Pool', icon: 'pool', location: 'Block A · Ground Floor', hours: '7:00 AM – 9:00 PM', capacity: 12, accent: 'aqua', description: 'A clean, temperature-controlled pool for residents and guests.' },
  { id: 2, name: 'Community Hall', icon: 'hall', location: 'Block A · First Floor', hours: '9:00 AM – 10:00 PM', capacity: 60, accent: 'gold', description: 'Spacious event room for celebrations, meetings and community gatherings.' },
  { id: 3, name: 'Fitness Studio', icon: 'gym', location: 'Block B · Ground Floor', hours: '6:00 AM – 10:00 PM', capacity: 15, accent: 'purple', description: 'A modern workout area with cardio and strength equipment.' },
  { id: 4, name: 'Co-working Lounge', icon: 'work', location: 'Clubhouse · First Floor', hours: '8:00 AM – 11:00 PM', capacity: 20, accent: 'blue', description: 'Quiet desks, fast Wi-Fi and comfortable spaces for focused work.' }
]

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ph_user') || 'null'))
  const [requests, setRequests] = useState(() => JSON.parse(localStorage.getItem('ph_requests') || JSON.stringify(seedRequests)))
  const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem('ph_bookings') || JSON.stringify(seedBookings)))
  const [toast, setToast] = useState('')

  useEffect(() => localStorage.setItem('ph_requests', JSON.stringify(requests)), [requests])
  useEffect(() => localStorage.setItem('ph_bookings', JSON.stringify(bookings)), [bookings])
  useEffect(() => {
    if (user) localStorage.setItem('ph_user', JSON.stringify(user))
    else localStorage.removeItem('ph_user')
  }, [user])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  const login = (email, role = 'tenant') => {
    const fallback = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    setUser({ name: fallback || 'Shivaji', email, role })
    setToast('Welcome back to PropertyHub')
  }

  const register = (name, email) => {
    setUser({ name, email, role: 'tenant' })
    setToast('Account created successfully')
  }

  const logout = () => {
    setUser(null)
    setToast('You have been logged out')
  }

  const addRequest = data => {
    const newRequest = {
      id: `MT-${Math.floor(1000 + Math.random() * 8999)}`,
      ...data,
      status: 'Pending',
      created: '30 Aug 2026'
    }
    setRequests(prev => [newRequest, ...prev])
    setToast('Maintenance request submitted')
  }

  const updateRequest = (id, status) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    setToast(`Request ${id} updated to ${status}`)
  }

  const addBooking = booking => {
    const conflict = bookings.some(b =>
      b.date === booking.date &&
      b.amenity === booking.amenity &&
      b.status !== 'Cancelled' &&
      booking.start < b.end &&
      booking.end > b.start
    )
    if (conflict) {
      setToast('That time slot is already booked')
      return false
    }
    setBookings(prev => [{ id: `BK-${Math.floor(100 + Math.random() * 899)}`, ...booking, status: 'Confirmed' }, ...prev])
    setToast('Amenity booked successfully')
    return true
  }

  const cancelBooking = id => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b))
    setToast('Booking cancelled')
  }

  const value = useMemo(
    () => ({ user, requests, bookings, amenities, toast, login, register, logout, addRequest, updateRequest, addBooking, cancelBooking }),
    [user, requests, bookings, toast]
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
