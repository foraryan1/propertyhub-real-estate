# PropertyHub

PropertyHub is a responsive resident-services web app for organizing maintenance requests, amenity bookings, resident accounts and a community blog. The final project combines a React frontend, an Express API and MongoDB-backed authentication and blog data.

## Features

- Resident registration, sign-in, profile editing and sign-out
- Protected resident pages and a personal dashboard
- MongoDB persistence for accounts, sessions and community posts
- Create, read, update and delete community posts, with ownership checks
- Search posts and filter them by category
- Amenity booking with overlapping time-slot checks
- Maintenance request and manager status workflows
- Mobile navigation and responsive layouts for small screens
- A single-service Render deployment: Express serves the built React app and `/api` endpoints

## Technology

- React 18, Vite 6, React Router and Lucide React
- Node.js 20+, Express 4 and Mongoose 8
- MongoDB Atlas or a local MongoDB server
- Render Web Service for the combined frontend and API

## Project layout

```text
server/        Express API, authentication and database models
src/           React pages, components, API client and app state
render.yaml    Render Blueprint for the production web service
DEPLOYMENT.md  Step-by-step Atlas and Render instructions
```

## Run locally

1. Install Node.js 20 or newer and start a local MongoDB server, or create a MongoDB Atlas database.
2. In the project folder, create a private environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Put your database connection string in `.env` as `MONGODB_URI`. Keep `.env` out of GitHub.
4. Install dependencies and start the API and Vite frontend in separate terminals:

   ```bash
   npm ci
   npm run server
   ```

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite. The API health endpoint is `http://localhost:4000/api/health`.

For a local production-style run, build the frontend and start the combined server:

```bash
npm run build
npm start
```

The server uses `PORT` when provided by the host, and serves the frontend and API from the same origin.

## Deploy

The repository includes `render.yaml`. Connect the GitHub repository to Render as a Blueprint, enter the secret `MONGODB_URI` when prompted, and let Render deploy the web service. See [DEPLOYMENT.md](DEPLOYMENT.md) for the MongoDB Atlas setup and exact steps.

## Data and security notes

- Passwords are hashed using Node's built-in `scrypt` with a unique random salt.
- Sessions use random bearer tokens. MongoDB stores only their SHA-256 hashes; sessions expire after seven days and sign-out revokes the active session.
- Database credentials belong in Render's secret environment variables or a local `.env` file, never in source code.
- Accounts, sessions and blog posts persist in MongoDB. Maintenance requests and amenity bookings are currently held in memory and reset when the server restarts; do not treat those two workflows as production storage yet.
- Use test accounts and non-sensitive data for this internship demo.

## API overview

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service and database health |
| POST | `/api/auth/register` | Create a resident account |
| POST | `/api/auth/login` | Sign in |
| GET, PATCH | `/api/auth/me` | Read or update the signed-in profile |
| POST | `/api/auth/logout` | Revoke the current session |
| GET, POST | `/api/blogs` | List or create community posts |
| GET | `/api/blogs/mine` | List posts by the signed-in user |
| GET, PATCH, DELETE | `/api/blogs/:id` | Read, update or delete a post |

The application also provides authenticated amenity, booking and maintenance routes. See `server/index.js` for the complete route list.
