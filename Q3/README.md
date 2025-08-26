# Q3: Express Login with Redis Session Store

A minimal Express app demonstrating login with sessions stored in Redis.

## Features
- Express + EJS views
- Sessions with `express-session` and `connect-redis`
- Demo credentials (admin/password)
- Protected dashboard route

## Setup
1. Ensure Redis is running locally on 6379 (or set `REDIS_URL`).
2. In the `Q3/` folder, install deps:
   ```bash
   npm install
   ```
3. Copy env example and adjust if needed:
   ```bash
   cp .env.example .env
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open: http://localhost:3003

## Routes
- GET `/login` — login form
- POST `/login` — authenticate (admin/password)
- GET `/dashboard` — protected page
- POST `/logout` — end session

## Notes
- For production, set a strong `SESSION_SECRET` and use HTTPS so `cookie.secure` can be enabled.
- Replace the hardcoded user with your DB logic.
