const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '')

async function request(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')
  if (options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new Error('Could not connect to the backend. Start the API server and try again.')
  }

  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'The request could not be completed.')
  return data
}

const json = value => JSON.stringify(value)

export const api = {
  health: () => request('/health'),
  register: body => request('/auth/register', { method: 'POST', body: json(body) }),
  login: body => request('/auth/login', { method: 'POST', body: json(body) }),
  me: token => request('/auth/me', { token }),
  updateProfile: (token, body) => request('/auth/me', { method: 'PATCH', token, body: json(body) }),
  logout: token => request('/auth/logout', { method: 'POST', token }),
  amenities: token => request('/amenities', { token }),
  maintenance: token => request('/maintenance', { token }),
  createMaintenance: (token, body) => request('/maintenance', { method: 'POST', token, body: json(body) }),
  updateMaintenance: (token, id, status) => request(`/maintenance/${encodeURIComponent(id)}`, { method: 'PATCH', token, body: json({ status }) }),
  bookings: token => request('/bookings', { token }),
  createBooking: (token, body) => request('/bookings', { method: 'POST', token, body: json(body) }),
  cancelBooking: (token, id) => request(`/bookings/${encodeURIComponent(id)}/cancel`, { method: 'PATCH', token }),
  blogs: token => request('/blogs', { token }),
  createBlog: (token, body) => request('/blogs', { method: 'POST', token, body: json(body) })
}

