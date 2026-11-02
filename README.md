# PropertyHub — Module 4: CRUD Operations

PropertyHub is a resident portal for property details, maintenance requests, shared amenity bookings and community updates. Module 4 completes the community blog workflow with create, read, update and delete operations, category labels, and search and category filters.

## Tech stack

- Frontend: React, Vite, React Router and Lucide React
- Backend: Node.js and Express 4
- Database: MongoDB Atlas or a local MongoDB server, accessed with Mongoose 8
- Authentication: salted password hashing with Node's built-in `scrypt`; only a hash of each seven-day bearer session is stored
- Email addresses are normalized and protected by a unique database index; password hashes are excluded from normal user queries and API responses

## Features

- Resident registration, sign-in, profile edits and sign-out
- MongoDB-backed resident and manager accounts, sessions and community blog posts
- Authenticated REST APIs for amenities, maintenance requests, bookings and community blog posts
- Blog list retrieved from MongoDB and a separate detail page for every post
- Full blog CRUD with ownership checks: authors manage their own posts and managers can moderate all posts
- Search posts by title, content or author; filter by Community, Events, Maintenance, Lifestyle or Announcements
- Blog validation, edited timestamps and explicit delete confirmation
- Manager-only maintenance status updates
- Booking overlap checks and cancellation permissions
- Server-side request validation and protected routes
- Responsive frontend connected to the backend

## Set up MongoDB

Install Node.js LTS and create a MongoDB database. MongoDB Atlas works for a hosted database; a local MongoDB server also works. In Atlas, create a database user, allow your development machine's IP under Network Access, and copy the Node.js connection string. Replace its username, password and cluster host with your Atlas values. URL-encode special characters in the database password. Do not commit your real connection string.

Copy `.env.example` to `.env`, then set `MONGODB_URI` to your connection string. The backend will not start until it can connect to MongoDB.

On Windows PowerShell, create the private environment file with:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and add the MongoDB URI. Keep `.env` private; it is ignored by Git.

## Run on your computer

Install the dependencies from the project folder:

```bash
npm install
```

Open **two terminals** in the same project folder. Start the backend in Terminal 1:

```bash
npm run server
```

Start the website in Terminal 2:

```bash
npm run dev
```

Open the local website URL printed by Vite, usually `http://localhost:5173`. The API runs at `http://localhost:4000`; its health endpoint is `http://localhost:4000/api/health`. It reports `database: connected` when MongoDB is ready.

## Optional manager account

By default, anyone can create a resident account. To seed a manager account, set these values in the private `.env` file:

```env
MANAGER_EMAIL=manager@example.com
MANAGER_PASSWORD=choose-a-unique-password-of-12-chars
```

Restart the backend, then sign in with those credentials. The role is assigned by the server; the browser cannot promote a resident to manager.

## API routes

| Method | Route | Access |
| --- | --- | --- |
| GET | `/api/health` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET, PATCH | `/api/auth/me` | Signed in |
| POST | `/api/auth/logout` | Signed in |
| GET | `/api/amenities` | Signed in |
| GET, POST | `/api/maintenance` | Signed in |
| PATCH | `/api/maintenance/:id` | Manager |
| GET, POST | `/api/bookings` | Signed in |
| PATCH | `/api/bookings/:id/cancel` | Booking owner or manager |
| GET, POST | `/api/blogs` | Signed in |
| GET | `/api/blogs/:id` | Signed in |
| PATCH | `/api/blogs/:id` | Post author or manager |
| DELETE | `/api/blogs/:id` | Post author or manager |

`GET /api/blogs` accepts optional `q` and `category` query parameters for server-side search and category filtering.

## Data behavior

Accounts, password hashes, seven-day sessions and blog posts persist in MongoDB across server restarts. Maintenance requests and amenity bookings are still held in memory and reset when the API restarts; they are outside the internship blog CRUD module's scope. Older in-memory accounts and posts are not migrated automatically.

The session token itself is returned to the signed-in client and kept in that browser tab's session storage. MongoDB stores only its SHA-256 hash, and expired sessions are removed by a database TTL index. Passwords remain salted and hashed with Node's `scrypt`; plaintext passwords are never stored.

## Before public deployment

Set a production `CLIENT_ORIGIN`, keep MongoDB credentials in the hosting provider's secret environment variables, and restrict the Atlas network allowlist to the backend host. Add database persistence for maintenance and bookings if those features also need to survive restarts.
