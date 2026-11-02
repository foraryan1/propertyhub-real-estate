# Deploy PropertyHub on Render

This setup deploys the React website and Express API together as one Node.js web service. MongoDB Atlas stores accounts, sessions and blog posts.

## Before you start

- Push the completed project to your GitHub repository.
- Have a MongoDB Atlas cluster, a database user and its connection string ready.
- Never paste the database password into a public file or GitHub commit.

## 1. Prepare MongoDB Atlas

1. In Atlas, create a database user with access to the `propertyhub` database. Use a unique, strong password.
2. In **Network Access**, allow the Render service to connect. After the Render service is created, open its **Connect → Outbound** panel and add the listed regional IP ranges to Atlas's IP access list. Render may use any address in those ranges. See [Render outbound IP addresses](https://render.com/docs/outbound-ip-addresses) and [MongoDB Atlas connection requirements](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/).
3. Copy Atlas's application connection string. Replace the username and password placeholders with the database user's credentials. URL-encode special characters in the password.

## 2. Create the Render service

1. Sign in to Render and choose **New → Blueprint**.
2. Connect GitHub and select `foraryan1/propertyhub-real-estate`.
3. Render reads the root `render.yaml`. Confirm the service settings:
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
   - Health check path: `/api/health`
4. Add the secret `MONGODB_URI` when prompted. Keep `MONGODB_DB` as `propertyhub` and `NODE_ENV` as `production`.
5. Create the Blueprint and wait for the deploy to finish. Render shows the site's `onrender.com` URL on the service page.

The service serves the frontend and API from one URL, so the production frontend calls `/api` on the same host. `CLIENT_ORIGIN` is only needed if you later host the frontend on a separate domain.

## 3. Check the deployment

1. Open `https://<your-render-service>.onrender.com/api/health`. A healthy service responds with `status: "ok"` and `database: "connected"`.
2. Open the Render URL without `/api/health`. The PropertyHub landing page should load.
3. Create a test resident account, sign in, create a community post, then refresh the page and confirm the post remains.
4. Check a direct route such as `/app/blog` in a new browser tab. Render's Express fallback should return the React app.

## Troubleshooting

- **Build fails:** confirm the Render service is using the repository root and `npm ci && npm run build`.
- **Health check reports database unavailable:** verify `MONGODB_URI`, database-user credentials, URL-encoded password characters, Atlas IP access rules and outbound access.
- **Login or blog requests fail:** inspect the Render service logs and confirm `MONGODB_DB` is `propertyhub`.
- **Refresh on a nested page returns an error:** confirm the service is running the current commit, including the Express SPA fallback in `server/index.js`.

## Demo limitations

Maintenance requests and amenity bookings are in-memory examples and will reset when the service restarts. Accounts, sessions and blog posts are persisted in MongoDB. Use test accounts and non-sensitive data for this internship deployment.
