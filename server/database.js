import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  role: { type: String, enum: ['resident', 'manager'], default: 'resident', required: true },
  phone: { type: String, default: '', maxlength: 25 },
  passwordHash: { type: String, required: true, select: false },
  createdAt: { type: Date, default: Date.now, immutable: true }
}, { versionKey: false })

const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  expiresAt: { type: Date, required: true, expires: 0 }
}, { versionKey: false })

const blogSchema = new Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
  content: { type: String, required: true, minlength: 20, maxlength: 5000 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  authorName: { type: String, required: true, trim: true, maxlength: 80 },
  createdAt: { type: Date, default: Date.now, immutable: true }
}, { versionKey: false })

blogSchema.index({ createdAt: -1 })

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema)
export const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema)

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Copy .env.example to .env and add your MongoDB connection string.')
  }

  const options = { serverSelectionTimeoutMS: 10000 }
  if (process.env.MONGODB_DB) options.dbName = process.env.MONGODB_DB

  await mongoose.connect(uri, options)
  await Promise.all([User.init(), Session.init(), Blog.init()])
  return mongoose.connection
}
