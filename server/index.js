import express from 'express'
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import mongoose from 'mongoose'
import { BLOG_CATEGORIES, Blog, connectDatabase, Session, User } from './database.js'

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => { req.body ||= {}; next() })

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'database unavailable',
    service: 'PropertyHub API',
    module: 4,
    database: connected ? 'connected' : 'disconnected'
  })
})

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const name = cleanText(req.body.name, 80)
  const email = normalizeEmail(req.body.email)
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  if (name.length < 2) return res.status(400).json({ error: 'Enter your full name.' })
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  let user
  try {
    user = await User.create({ name, email, passwordHash: await hashPassword(password) })
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'An account with this email already exists.' })
    throw error
  }
  const token = await createSession(user)
  res.status(201).json({ user: publicUser(user), token })
}))

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' })
  }
  res.json({ user: publicUser(user), token: await createSession(user) })
}))

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

app.patch('/api/auth/me', requireAuth, asyncRoute(async (req, res) => {
  const name = cleanText(req.body.name, 80)
  const email = normalizeEmail(req.body.email)
  if (name.length < 2) return res.status(400).json({ error: 'Enter your full name.' })
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
  try {
    const updated = await User.findByIdAndUpdate(req.user._id, {
      name,
      email,
      phone: cleanText(req.body.phone, 25)
    }, { new: true, runValidators: true })
    res.json({ user: publicUser(updated) })
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'That email address is already in use.' })
    throw error
  }
}))

app.post('/api/auth/logout', requireAuth, asyncRoute(async (req, res) => {
  await Session.deleteOne({ _id: req.sessionId })
  res.sendStatus(204)
}))

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

app.get('/api/blogs', requireAuth, asyncRoute(async (req, res) => {
  const search = cleanText(req.query.q, 80)
  const category = cleanText(req.query.category, 40)
  if (category && category !== 'All categories' && !BLOG_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Choose a valid blog category.' })
  }
  const filter = {}
  if (category && category !== 'All categories') filter.category = category
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { content: { $regex: escaped, $options: 'i' } },
      { authorName: { $regex: escaped, $options: 'i' } }
    ]
  }
  const blogs = await Blog.find(filter).sort({ createdAt: -1 }).lean()
  res.json({ blogs: blogs.map(publicBlog) })
}))

app.get('/api/blogs/:id', requireAuth, asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Blog post not found.' })
  const blog = await Blog.findById(req.params.id).lean()
  if (!blog) return res.status(404).json({ error: 'Blog post not found.' })
  res.json({ blog: publicBlog(blog) })
}))

app.post('/api/blogs', requireAuth, asyncRoute(async (req, res) => {
  const title = cleanText(req.body.title, 120)
  const content = cleanText(req.body.content, 5000)
  const category = cleanText(req.body.category || 'Community', 40)
  if (title.length < 5) return res.status(400).json({ error: 'Blog title must be at least 5 characters.' })
  if (content.length < 20) return res.status(400).json({ error: 'Blog content must be at least 20 characters.' })
  if (!BLOG_CATEGORIES.includes(category)) return res.status(400).json({ error: 'Choose a valid blog category.' })
  const now = new Date()
  const blog = await Blog.create({
    title,
    content,
    category,
    author: req.user._id,
    authorName: req.user.name,
    createdAt: now,
    updatedAt: now
  })
  res.status(201).json({ blog: publicBlog(blog) })
}))

app.patch('/api/blogs/:id', requireAuth, asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Blog post not found.' })
  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Blog post not found.' })
  if (!canManageBlog(req.user, blog)) return res.status(403).json({ error: 'You can only edit your own blog posts.' })

  const title = req.body.title === undefined ? blog.title : cleanText(req.body.title, 120)
  const content = req.body.content === undefined ? blog.content : cleanText(req.body.content, 5000)
  const category = req.body.category === undefined ? (blog.category || 'Community') : cleanText(req.body.category, 40)
  if (title.length < 5) return res.status(400).json({ error: 'Blog title must be at least 5 characters.' })
  if (content.length < 20) return res.status(400).json({ error: 'Blog content must be at least 20 characters.' })
  if (!BLOG_CATEGORIES.includes(category)) return res.status(400).json({ error: 'Choose a valid blog category.' })

  blog.title = title
  blog.content = content
  blog.category = category
  blog.updatedAt = new Date()
  await blog.save()
  res.json({ blog: publicBlog(blog) })
}))

app.delete('/api/blogs/:id', requireAuth, asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Blog post not found.' })
  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Blog post not found.' })
  if (!canManageBlog(req.user, blog)) return res.status(403).json({ error: 'You can only delete your own blog posts.' })
  await blog.deleteOne()
  res.sendStatus(204)
}))

app.use((req, res) => res.status(404).json({ error: 'API route not found.' }))
app.use((error, req, res, next) => {
  console.error(error)
  res.status(error.status || 500).json({ error: 'The server could not complete this request.' })
})

await connectDatabase()
await seedManagerFromEnvironment()

app.listen(port, () => {
  console.log(`PropertyHub API listening at http://localhost:${port}`)
  console.log('MongoDB connected. Users, sessions and community blogs persist across restarts.')
  console.log('Maintenance requests and amenity bookings remain in memory in this module.')
})

const requireAuth = asyncRoute(async (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) {
    return res.status(401).json({ error: 'Please sign in to continue.' })
  }
  const tokenHash = hashToken(token)
  const session = await Session.findOne({ tokenHash, expiresAt: { $gt: new Date() } }).select('+tokenHash')
  if (!session) return res.status(401).json({ error: 'Please sign in to continue.' })
  const user = await User.findById(session.userId)
  if (!user) return res.status(401).json({ error: 'Please sign in to continue.' })
  req.user = user
  req.sessionId = session._id
  next()
})

function requireManager(req, res, next) {
  if (req.user.role !== 'manager') return res.status(403).json({ error: 'Manager access is required.' })
  next()
}

function canManageBlog(user, blog) {
  return user.role === 'manager' || String(blog.author) === String(user._id)
}

async function createSession(user) {
  const token = randomBytes(32).toString('base64url')
  await Session.create({
    userId: user._id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
  return token
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
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
  if (await User.exists({ email })) return
  await User.create({
    name: 'Property Manager',
    email,
    role: 'manager',
    passwordHash: await hashPassword(password),
  })
}

function publicUser(user) {
  return { id: String(user._id || user.id), name: user.name, email: user.email, role: user.role, phone: user.phone || '' }
}

function publicBlog(blog) {
  return {
    id: String(blog._id || blog.id),
    title: blog.title,
    content: blog.content,
    category: blog.category || 'Community',
    author: blog.authorName || blog.author,
    authorId: String(blog.author?._id || blog.author || blog.authorId || ''),
    createdAt: new Date(blog.createdAt).toISOString(),
    updatedAt: new Date(blog.updatedAt || blog.createdAt).toISOString()
  }
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
