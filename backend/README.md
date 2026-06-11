# node-starter

Node.js + Express + JWT boilerplate — Layer 0 + Layer 1 ready.

## What's included

- Express server with security headers (helmet), CORS, logging (morgan)
- JWT authentication — register, login, protect middleware
- Input validation with express-validator
- Global error handling (404 + 500)
- Clean folder structure

## Setup

```bash
npm install
cp .env.example .env   # .env fill করো
npm run dev
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | — | Server check |
| POST | /api/auth/register | — | New user |
| POST | /api/auth/login | — | Get token |
| GET | /api/auth/me | ✅ | Current user |

## Add a database

**MongoDB:**
```bash
npm install mongoose
```
`server.js`-এ uncomment করো:
```js
const connectDB = require('./config/db');
connectDB();
```

**PostgreSQL:**
```bash
npm install pg
```

## Add layers

| Feature | Package | 
|---------|---------|
| MongoDB | `mongoose` |
| PostgreSQL | `pg` or `prisma` |
| Real-time | `socket.io` |
| File upload | `multer` + `cloudinary` |
| Email | `nodemailer` |
| Rate limiting | `express-rate-limit` |

## Folder structure

```
src/
├── server.js          # Entry point
├── routes/            # Route definitions
├── controllers/       # Business logic
├── middleware/        # Auth, validation, error
├── utils/             # Helper functions
└── config/            # DB connections
```
