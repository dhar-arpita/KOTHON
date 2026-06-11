# react-starter

React + Vite + Tailwind + Axios + React Router boilerplate.

## What's included

- React 18 + Vite (fast dev server)
- Tailwind CSS for styling
- React Router v6 for navigation
- Axios with JWT interceptor (auto attach token, auto redirect on 401)
- AuthContext — global user state, login/logout/register
- ProtectedRoute + PublicRoute components
- Login + Register pages (ready to use)

## Setup

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:3000
```

## Add a feature

**নতুন page:**
1. `src/pages/NewPage.jsx` বানাও
2. `App.jsx`-এ route যোগ করো

**নতুন API call:**
`src/services/api.js`-এ নতুন export যোগ করো:
```js
export const postAPI = {
  getAll: () => api.get('/posts'),
  create: (data) => api.post('/posts', data),
};
```

**Socket.io লাগলে:**
```bash
npm install socket.io-client
```
`src/context/SocketContext.jsx` বানাও।

## Folder structure

```
src/
├── App.jsx                  # Routes
├── main.jsx                 # Entry point
├── index.css                # Tailwind base
├── pages/                   # Full pages
├── components/
│   ├── ui/                  # Reusable UI (Button, Input, Modal...)
│   └── layout/              # ProtectedRoute, Navbar, Sidebar...
├── context/
│   └── AuthContext.jsx      # Global auth state
├── services/
│   └── api.js               # All API calls
├── hooks/                   # Custom hooks
└── utils/                   # Helper functions
```
