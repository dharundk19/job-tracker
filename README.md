# 💼 JobTrackr — MERN Stack Job Application Tracker

> Full-stack app to track job applications from first apply to offer.  
> MongoDB · Express · React 18 · Node.js · JWT · Socket.IO · Cloudinary · Nodemailer

---

## 🚀 Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/YOUR_USERNAME/jobtrackr.git
cd jobtrackr
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Cloudinary & Gmail keys
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Edit .env — set VITE_API_URL and VITE_SOCKET_URL
npm run dev
```

Open http://localhost:5173

---

## 🗂️ Project Structure

```
jobtrackr/
├── server/
│   └── src/
│       ├── config/db.js              # MongoDB connection
│       ├── models/
│       │   ├── User.model.js
│       │   ├── Job.model.js
│       │   └── Reminder.model.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── job.controller.js
│       │   └── reminder.controller.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── job.routes.js
│       │   └── reminder.routes.js
│       ├── middleware/auth.middleware.js
│       ├── services/
│       │   ├── upload.service.js     # Cloudinary
│       │   └── email.service.js      # Nodemailer
│       ├── socket/socket.js          # Socket.IO
│       └── index.js                  # Entry point + cron
│
└── client/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Dashboard.jsx
        ├── components/
        │   ├── KanbanBoard.jsx       # Drag-and-drop board
        │   ├── JobCard.jsx
        │   ├── AddJobModal.jsx
        │   ├── Analytics.jsx         # Recharts dashboard
        │   ├── Navbar.jsx
        │   └── ReminderForm.jsx
        ├── store/useJobStore.js      # Zustand state
        ├── services/api.js           # Axios + JWT interceptor
        ├── hooks/useAuth.js          # Auth context
        └── App.jsx
```

---

## 🔑 Environment Variables

### server/.env

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/jobtrackr
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### client/.env

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📡 API Reference

### Auth — `/api/auth`
| Method | Route | Body | Response |
|--------|-------|------|----------|
| POST | /register | `{ name, email, password }` | `{ token, user }` |
| POST | /login | `{ email, password }` | `{ token, user }` |
| GET | /me | Bearer token | `{ user }` |

### Jobs — `/api/jobs` (all protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Get all jobs (supports `?status=&search=&sort=`) |
| POST | / | Create job |
| GET | /:id | Get single job |
| PUT | /:id | Update job |
| DELETE | /:id | Delete job |
| POST | /:id/resume | Upload resume to Cloudinary |
| GET | /export/pdf | Download jobs as PDF |
| GET | /export/csv | Download jobs as CSV |

### Reminders — `/api/reminders`
| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Get all reminders |
| POST | / | Create reminder `{ jobId, reminderDate, message }` |
| DELETE | /:id | Delete reminder |

---

## 🌐 Deployment

### MongoDB Atlas
1. Create free M0 cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Database Access → Add user with read/write permissions
3. Network Access → Allow `0.0.0.0/0`
4. Copy connection string as `MONGO_URI`

### Backend → Render.com
1. Push `server/` to GitHub
2. New Web Service → Root: `server` → Start: `node src/index.js`
3. Add all `.env` vars in Render dashboard

### Frontend → Vercel
1. Push `client/` to GitHub
2. New Project → Root: `client/`
3. Add `VITE_API_URL` and `VITE_SOCKET_URL` pointing to Render URL

---

## ✨ Features

- ✅ JWT Auth (Register / Login / Auto-logout on token expiry)
- ✅ Job CRUD (Create, Read, Update, Delete)
- ✅ Drag-and-drop Kanban board (@dnd-kit)
- ✅ List view with search & status filters
- ✅ Analytics dashboard (Recharts — pie + bar charts)
- ✅ Email reminders via Nodemailer + node-cron
- ✅ Resume uploads via Cloudinary
- ✅ Real-time sync across tabs via Socket.IO
- ✅ PDF & CSV export
- ✅ Role-based access (admin / user)
- ✅ Dark UI with Tailwind CSS
- ✅ Responsive (mobile-first)
