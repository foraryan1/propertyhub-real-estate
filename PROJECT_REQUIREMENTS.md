# PropertyHub — Requirement Mapping

| Internship requirement | Frontend implementation |
|---|---|
| Web-based responsive platform | Responsive React UI with desktop/tablet/mobile layouts |
| Maintenance request creation | Maintenance page + modal form |
| Pending / In Progress / Completed | Status badges + manager status controls |
| Real-time visibility | Shared React state updates immediately across views |
| Amenity availability | Amenities page with live-style availability UI |
| Date/time booking | Booking modal with date, check-in and check-out |
| Conflict prevention | Booking overlap validation before confirmation |
| Maintenance overview | Resident dashboard + manager console |
| Amenity usage overview | Dashboard + manager activity cards |
| Real-time monitoring | Immediate state-driven UI updates |
| Simple clean UI | Elegant Green design system |
| Modular architecture | Pages/components/context separation |
| Deployment | Render-ready single Node.js service for the Vite frontend and Express API; MongoDB Atlas stores accounts, sessions and blogs |
| Module 4 blog CRUD | MongoDB-backed create, read, update and delete with author/manager permissions |
| Module 4 discovery | Search by title/content/author and filter posts by category |
| Module 5 authentication | Random server-side bearer sessions, hashed session tokens, expiry and logout revocation |
| Module 5 private dashboard | Protected app routes and a dashboard feed fetched only for the signed-in user |
| Module 5 account controls | Resident profile updates and logout action |
| Module 6 final project | Production build served by Express, SPA route fallback, deployment blueprint, health check and deployment guide |

## Deployment limitations
- Maintenance requests and amenity bookings are held in memory and reset when the server restarts.
- Accounts, sessions and blog posts persist in MongoDB.

## Intentionally out of scope
- Native mobile app
- Online rental payments
- AI predictive maintenance
- IoT integrations
