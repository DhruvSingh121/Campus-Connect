# CampusConnect — College Event & Club Management System (MERN)

A full-stack rebuild of the CampusConnect prototype: React frontend +
Node/Express/MongoDB backend, with real authentication (JWT + bcrypt),
role-based access control, dark mode, toggle switches, a live
notification bell, and interactive modals for every action.

## Stack
- **Frontend:** React 18 (Vite), React Router v6, react-icons, Axios, Context API
- **Backend:** Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, express-validator
- **Auth:** JWT access tokens, bcrypt-hashed passwords, role guards (student / clubadmin / superadmin)

## Project structure
```
campusconnect/
├── backend/
│   ├── config/db.js
│   ├── models/            User, Club, Event, Request, Notification
│   ├── middleware/auth.js JWT verification + role authorization
│   ├── routes/             auth, clubs, events, requests, notifications, users
│   ├── utils/seed.js       seeds demo data
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js         axios instance with auth interceptor
        ├── context/             AuthContext, ThemeContext, ToastContext
        ├── components/          Sidebar, Topbar, Modal, ToggleSwitch,
        │                        NotificationBell, EventCard, ClubCard, forms...
        ├── pages/                Login, Dashboard, Events, Clubs, MyClubs,
        │                        Members, Requests, Students, ClubAdmins,
        │                        Notifications, Profile
        └── styles/index.css      responsive, dark-mode-aware styling
```

## Getting started

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET if needed
npm run seed               # creates demo clubs, users, events, requests, notifications
npm run dev                 # starts the API on http://localhost:5000
```
Requires a running MongoDB instance (local `mongod` or a MongoDB Atlas URI in `.env`).

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL, defaults to http://localhost:5000/api
npm run dev                 # starts Vite on http://localhost:5173
```

### Demo accounts (password: `password123`, created by `npm run seed`)
| Role        | Email                       |
|-------------|------------------------------|
| Student     | student@college.edu          |
| Club Admin  | rahul.sharma@college.edu (Coding Club) |
| Super Admin | superadmin@college.edu       |

You can also register a brand-new student account from the login screen —
passwords are hashed with bcrypt before they ever touch the database.

## Features
- **Auth:** register/login with bcrypt password hashing + JWT, protected routes, auto-logout on expired token
- **Roles:** student, club admin (scoped to their own club), super admin (full access)
- **Clubs:** browse, join/leave (student), create clubs & assign admins (super admin)
- **Events:** browse, create (club admin/super admin), register (student), approve/reject (super admin)
- **Requests:** club admins see only their own club's join requests; super admin sees all
- **Notifications:** live bell with unread badge, polling every 20s, send announcements (admin roles)
- **Dark mode:** toggle switch in the topbar and profile page, persisted to localStorage, respects system preference on first load
- **Responsive:** sidebar collapses to a bottom bar on mobile, grids reflow for tablet/phone
- **Toasts:** every mutating action gives interactive feedback

## Notes for production
- Set a strong, random `JWT_SECRET` in `backend/.env`
- Point `MONGO_URI` at your real MongoDB deployment (e.g. MongoDB Atlas)
- Run `npm run build` in `frontend/` and serve the `dist/` folder from a static host or behind the Express server
- Consider adding refresh tokens, email verification and rate limiting for a real deployment
