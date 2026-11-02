# PropertyHub — Module 2: Backend Development

PropertyHub is a resident portal for property details, maintenance requests, shared amenity bookings and community updates. Module 2 adds a Node.js/Express REST API and connects the React frontend to it.

## Tech stack

- Frontend: React, Vite, React Router and Lucide React
- Backend: Node.js and Express 4
- Authentication: password hashing with Node's built-in `scrypt`, bearer sessions and role checks
- Module 2 data store: in-memory (data resets whenever the API process restarts)

## Module 2 features

- Resident registration, sign-in, profile edits and sign-out
- Authenticated REST APIs for amenities, maintenance requests, bookings and community blog posts
- Manager-only maintenance status updates
- Booking overlap checks and cancellation permissions
- Server-side request validation and protected routes
- Responsive frontend connected to the backend

## Run on your computer

Install Node.js LTS first. Then open the project folder in a terminal and install the dependencies:

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

Open the local website URL printed by Vite, usually `http://localhost:5173`. The API runs at `http://localhost:4000`; its health endpoint is `http://localhost:4000/api/health`.

## Optional manager account

By default, anyone can create a resident account. To seed a manager account, create a private `.env` file in the project folder (do not commit it):

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

## Next module

Connect MongoDB or Supabase so accounts, requests, bookings and posts persist after the backend restarts. Also add production deployment settings, environment-specific CORS origins and a database-backed session strategy before public launch.
