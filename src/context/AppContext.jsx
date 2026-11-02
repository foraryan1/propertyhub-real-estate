import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api'

const AppContext = createContext(null)
const TOKEN_KEY = 'propertyhub_session'

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [requests, setRequests] = useState([])
  const [bookings, setBookings] = useState([])
  const [amenities, setAmenities] = useState([])
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  useEffect(() => {
    let active = true
    const token = sessionStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return () => { active = false } }
    api.me(token)
      .then(({ user: currentUser }) => active && setUser(currentUser))
      .then(() => active && loadWorkspace(token))
      .catch(() => { sessionStorage.removeItem(TOKEN_KEY); if (active) setUser(null) })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  const loadWorkspace = async token => {
    const [requestData, bookingData, amenityData, blogData] = await Promise.all([
      api.maintenance(token), api.bookings(token), api.amenities(token), api.blogs(token)
    ])
    setRequests(requestData.requests)
    setBookings(bookingData.bookings)
    setAmenities(amenityData.amenities)
    setBlogs(blogData.blogs)
  }

  const token = () => sessionStorage.getItem(TOKEN_KEY)
  const handleError = error => { setToast(error.message); return false }

  const login = async (email, password) => {
    try {
      const result = await api.login({ email, password })
      sessionStorage.setItem(TOKEN_KEY, result.token)
      setUser(result.user)
      await loadWorkspace(result.token)
      setToast('Welcome back to PropertyHub')
      return true
    } catch (error) { setToast(error.message); return error.message }
  }

  const register = async (name, email, password) => {
    try {
      const result = await api.register({ name, email, password })
      sessionStorage.setItem(TOKEN_KEY, result.token)
      setUser(result.user)
      await loadWorkspace(result.token)
      setToast('Account created successfully')
      return true
    } catch (error) { setToast(error.message); return error.message }
  }

  const logout = async () => {
    const savedToken = token()
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null); setRequests([]); setBookings([]); setBlogs([])
    if (savedToken) { try { await api.logout(savedToken) } catch { /* local session is already cleared */ } }
    setToast('You have been logged out')
  }

  const addRequest = async data => {
    try { const { request } = await api.createMaintenance(token(), data); setRequests(previous => [request, ...previous]); setToast('Maintenance request submitted'); return true }
    catch (error) { return handleError(error) }
  }

  const updateRequest = async (id, status) => {
    try { const { request } = await api.updateMaintenance(token(), id, status); setRequests(previous => previous.map(item => item.id === id ? request : item)); setToast(`Request ${id} updated to ${status}`); return true }
    catch (error) { return handleError(error) }
  }

  const addBooking = async booking => {
    try { const { booking: created } = await api.createBooking(token(), booking); setBookings(previous => [created, ...previous]); setToast('Amenity booked successfully'); return true }
    catch (error) { return handleError(error) }
  }

  const cancelBooking = async id => {
    try { const { booking } = await api.cancelBooking(token(), id); setBookings(previous => previous.map(item => item.id === id ? booking : item)); setToast('Booking cancelled'); return true }
    catch (error) { return handleError(error) }
  }

  const addBlog = async body => {
    try { const { blog } = await api.createBlog(token(), body); setBlogs(previous => [blog, ...previous]); setToast('Community blog published'); return true }
    catch (error) { return handleError(error) }
  }

  const updateProfile = async body => {
    try { const { user: updated } = await api.updateProfile(token(), body); setUser(updated); setToast('Profile updated'); return true }
    catch (error) { return handleError(error) }
  }

  const value = useMemo(() => ({
    user, requests, bookings, amenities, blogs, loading, toast, login, register, logout,
    addRequest, updateRequest, addBooking, cancelBooking, addBlog, updateProfile
  }), [user, requests, bookings, amenities, blogs, loading, toast])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() { return useContext(AppContext) }
