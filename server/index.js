import express from 'express'
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const serverDir = dirname(fileURLToPath(import.meta.url))
const projectDir = dirname(serverDir)

loadEnvFile(join(projectDir, '.env'))

const app = express()
const port = Number(process.env.PORT || 4000)
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean)
])

const store = {
  users: [],
  sessions: new Map(),
  blogs: [],
  maintenanceRequests: [],
  bookings: [],
  amenities: [
    { id: 1, name: 'Swimming Pool', location: 'Block A · Ground Floor', hours: '7:00 AM – 9:00 PM', capacity: 12, accent: 'aqua', description: 'A clean, temperature-controlled pool for residents and guests.' },
    { id: 2, name: 'Community Hall', location: 'Block A · First Floor', hours: '9:00 AM – 10:00 PM', capacity: 60, accent: 'gold', description: 'A space for celebrations, meetings and community gatherings.' },
    { id: 3, name: 'Fitness Studio', location: 'Block B · Ground Floor', hours: '6:00 AM – 10:00 PM', capacity: 15, accent: 'purple', description: 'A workout area with cardio and strength equipment.' },
    { id: 4, name: 'Co-working Lounge', location: 'Clubhouse · First Floor', hours: '8:00 AM – 11:00 PM', capacity: 20, accent: 'blue', description: 'Quiet desks, fast Wi-Fi and comfortable spaces for focused work.' }
  ]
}

const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)

app.disable('x-powered-by')
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({ error: 'This website is not allowed to access the API.' })
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => { req.body ||= {}; next() })

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PropertyHub API', module: 2 })
})

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const name = cleanText(req.body.name, 80)
  const email = normalizeEmail(req.body.email)
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  if (name.length < 2) return res.status(400).json({ error: 'Enter your full name.' })
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  if (store.users.some(user => user.email === email)) return res.status(409).json({ error: 'An account with this email already exists.' })

  const user = {
    id: randomBytes(16).toString('hex'),
    name,
    email,
    role: 'resident',
    phone: '',
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString()
  }
  store.users.push(user)
  const token = createSession(user)
  res.status(201).json({ user: publicUser(user), token })
}))

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  const user = store.users.find(candidate => candidate.email === email)
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' })
  }
  res.json({ user: publicUser(user), token: createSession(user) })
}))

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

app.patch('/api/auth/me', requireAuth, (req, res) => {
  const name = cleanText(req.body.name, 80)
  const email = normalizeEmail(req.body.email)
  if (name.length < 2) return res.status(400).json({ error: 'Enter your full name.' })
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (store.users.some(user => user.email === email && user.id !== req.user.id)) {
    return res.status(409).json({ error: 'That email address is already in use.' })
  }
  req.user.name = name
  req.user.email = email
  req.user.phone = cleanText(req.body.phone, 25)
  res.json({ user: publicUser(req.user) })
})

app.post('/api/auth/logout', requireAuth, (req, res) => {
  store.sessions.delete(req.token)
  res.sendStatus(204)
})

app.get('/api/amenities', requireAuth, (req, res) => {
  res.json({ amenities: store.amenities })
})

app.get('/api/maintenance', requireAuth, (req, res) => {
  const requests = req.user.role === 'manager'
    ? store.maintenanceRequests
    : store.maintenanceRequests.filter(request => request.residentId === req.user.id)
  res.json({ requests: [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) })
})

app.post('/api/maintenance', requireAuth, (req, res) => {
  const title = cleanText(req.body.title, 100)
  const location = cleanText(req.body.location, 100)
  const description = cleanText(req.body.description, 1000)
  const priority = req.body.priority
  if (title.length < 3 || !location || description.length < 5) {
    return res.status(400).json({ error: 'Add an issue title, location and description.' })
  }
  if (!['Low', 'Medium', 'High'].includes(priority)) {
    return res.status(400).json({ error: 'Choose a valid priority.' })
  }
  const createdAt = new Date().toISOString()
  const request = {
    id: `MT-${randomBytes(3).toString('hex').toUpperCase()}`,
    residentId: req.user.id,
    title,
    location,
    description,
    priority,
    status: 'Pending',
    createdAt,
    created: formatDate(createdAt)
  }
  store.maintenanceRequests.unshift(request)
  res.status(201).json({ request })
})

app.patch('/api/maintenance/:id', requireAuth, requireManager, (req, res) => {
  const request = store.maintenanceRequests.find(item => item.id === req.params.id)
  if (!request) return res.status(404).json({ error: 'Maintenance request not found.' })
  if (!['Pending', 'In Progress', 'Completed'].includes(req.body.status)) {
    return res.status(400).json({ error: 'Choose a valid request status.' })
  }
  request.status = req.body.status
  res.json({ request })
})

app.get('/api/bookings', requireAuth, (req, res) => {
  const bookings = req.user.role === 'manager'
    ? store.bookings
    : store.bookings.filter(booking => booking.residentId === req.user.id)
  res.json({ bookings: [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) })
})

app.post('/api/bookings', requireAuth, (req, res) => {
  const amenity = store.amenities.find(item => item.name === cleanText(req.body.amenity, 80))
  const date = typeof req.body.date === 'string' ? req.body.date : ''
  const start = typeof req.body.start === 'string' ? req.body.start : ''
  const end = typeof req.body.end === 'string' ? req.body.end : ''
  const startMinutes = toMinutes(start)
  const endMinutes = toMinutes(end)
  if (!amenity || !/^\d{4}-\d{2}-\d{2}$/.test(date) || startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
    return res.status(400).json({ error: 'Choose a valid amenity, date and time range.' })
  }
  const conflict = store.bookings.some(booking =>
    booking.amenity === amenity.name &&
    booking.date === date &&
    booking.status !== 'Cancelled' &&
    startMinutes < toMinutes(booking.end) &&
    endMinutes > toMinutes(booking.start)
  )
  if (conflict) return res.status(409).json({ error: 'That time slot is already booked.' })

  const createdAt = new Date().toISOString()
  const booking = {
    id: `BK-${randomBytes(3).toString('hex').toUpperCase()}`,
    residentId: req.user.id,
    amenity: amenity.name,
    date,
    start,
    end,
    status: 'Confirmed',
    createdAt
  }
  store.bookings.unshift(booking)
  res.status(201).json({ booking })
})

app.patch('/api/bookings/:id/cancel', requireAuth, (req, res) => {
  const booking = store.bookings.find(item => item.id === req.params.id)
  if (!booking) return res.status(404).json({ error: 'Booking not found.' })
  if (req.user.role !== 'manager' && booking.residentId !== req.user.id) {
    return res.status(403).json({ error: 'You cannot cancel another resident’s booking.' })
  }
  booking.status = 'Cancelled'
  res.json({ booking })
})

app.get('/api/blogs', requireAuth, (req, res) => {
  res.json({ blogs: [...store.blogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) })
})

app.post('/api/blogs', requireAuth, (req, res) => {
  const title = cleanText(req.body.title, 120)
  const content = cleanText(req.body.content, 5000)
  if (title.length < 5) return res.status(400).json({ error: 'Blog title must be at least 5 characters.' })
  if (content.length < 20) return res.status(400).json({ error: 'Blog content must be at least 20 characters.' })
  const blog = {
    id: randomBytes(12).toString('hex'),
    title,
    content,
    author: req.user.name,
    authorId: req.user.id,
    createdAt: new Date().toISOString()
  }
  store.blogs.unshift(blog)
  res.status(201).json({ blog })
})

app.use((req, res) => res.status(404).json({ error: 'API route not found.' }))
app.use((error, req, res, next) => {
  console.error(error)
  res.status(error.status || 500).json({ error: 'The server could not complete this request.' })
})

await seedManagerFromEnvironment()

app.listen(port, () => {
  console.log(`PropertyHub API listening at http://localhost:${port}`)
  console.log('Module 2 uses in-memory data; data resets when the server restarts.')
})

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  const session = token ? store.sessions.get(token) : null
  if (!session || session.expiresAt <= Date.now()) {
    if (token) store.sessions.delete(token)
    return res.status(401).json({ error: 'Please sign in to continue.' })
  }
  const user = store.users.find(item => item.id === session.userId)
  if (!user) return res.status(401).json({ error: 'Please sign in to continue.' })
  req.user = user
  req.token = token
  next()
}

function requireManager(req, res, next) {
  if (req.user.role !== 'manager') return res.status(403).json({ error: 'Manager access is required.' })
  next()
}

function createSession(user) {
  const token = randomBytes(32).toString('base64url')
  store.sessions.set(token, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  return token
}

async function hashPassword(password) {
  const salt = randomBytes(16)
  const derived = await scryptAsync(password, salt, 64)
  return `${salt.toString('hex')}:${derived.toString('hex')}`
}

async function verifyPassword(password, savedHash) {
  const [saltHex, keyHex] = (savedHash || '').split(':')
  if (!saltHex || !keyHex) return false
  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(keyHex, 'hex')
  const actual = await scryptAsync(password, salt, expected.length)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

async function seedManagerFromEnvironment() {
  const email = normalizeEmail(process.env.MANAGER_EMAIL)
  const password = process.env.MANAGER_PASSWORD || ''
  if (!email && !password) return
  if (!isValidEmail(email) || password.length < 12) {
    throw new Error('Set a valid MANAGER_EMAIL and a MANAGER_PASSWORD of at least 12 characters in .env.')
  }
  if (store.users.some(user => user.email === email)) return
  store.users.push({
    id: randomBytes(16).toString('hex'),
    name: 'Property Manager',
    email,
    role: 'manager',
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString()
  })
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' }
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function toMinutes(value) {
  const match = typeof value === 'string' && value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  let hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 1 || hours > 12 || minutes > 59) return null
  if (match[3].toUpperCase() === 'PM' && hours !== 12) hours += 12
  if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]] !== undefined) continue
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2')
    process.env[match[1]] = value
  }
}
