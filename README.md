# 🎓 LearnAI — AI-Powered Learning Support Platform

A full-stack web application with role-based access for Students, Mentors, and Admins (NGO).

---

## 📁 Folder Structure

```
learning-platform/
├── backend/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin SDK init
│   ├── controllers/
│   │   └── authController.js    # Register, profile, user management logic
│   ├── middleware/
│   │   └── auth.js              # Token verification + role guard
│   ├── routes/
│   │   └── auth.js              # Auth API routes
│   ├── .env                     # Backend environment variables
│   ├── server.js                # Express entry point
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── DashboardLayout.js  # Main layout with sidebar + topbar
    │   │   ├── Sidebar.js          # Role-aware navigation sidebar
    │   │   ├── Topbar.js           # Top header bar
    │   │   └── ProtectedRoute.js   # Auth + role guard for routes
    │   ├── context/
    │   │   └── AuthContext.js      # Global auth state (login/signup/logout)
    │   ├── pages/
    │   │   ├── Login.js            # Login page
    │   │   ├── Signup.js           # Signup page with role selection
    │   │   ├── Dashboard.js        # Role-based home dashboard
    │   │   ├── Courses.js          # Student: course list with progress
    │   │   ├── AiTutor.js          # Student: AI chat tutor
    │   │   ├── ManageUsers.js      # Admin: user list + role management
    │   │   └── Placeholder.js      # Progress, Students, Sessions, etc.
    │   ├── services/
    │   │   ├── firebase.js         # Firebase client SDK init
    │   │   └── api.js              # Axios API calls to backend
    │   ├── App.js                  # Routes definition
    │   ├── index.js                # React entry point
    │   └── index.css               # Global styles + CSS variables
    ├── .env                        # Frontend environment variables
    └── package.json
```

---

## ⚙️ Setup Instructions

### Step 1 — Firebase Project Setup

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g., `learnai-platform`)
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Enable **Firestore Database** → Start in test mode
5. Go to **Project Settings** → **Service Accounts** → Generate new private key
   - Save the downloaded JSON file
6. Go to **Project Settings** → **General** → Your apps → Add Web App
   - Copy the Firebase config object

---

### Step 2 — Backend Setup

```bash
cd learning-platform/backend
npm install
```

Edit `backend/.env` with your Firebase service account values:

```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

Start the backend:

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### Step 3 — Frontend Setup

```bash
cd learning-platform/frontend
npm install
```

Edit `frontend/.env` with your Firebase web app config:

```env
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔐 Role-Based Access

| Role    | Access                                          |
|---------|-------------------------------------------------|
| Student | Courses, AI Tutor, Progress tracker             |
| Mentor  | Student list, Sessions, Resource uploads        |
| Admin   | User management, Role assignment, Reports       |

---

## 🌐 API Endpoints

| Method | Endpoint                        | Auth     | Description           |
|--------|---------------------------------|----------|-----------------------|
| POST   | /api/auth/register              | None     | Register new user     |
| GET    | /api/auth/profile               | Required | Get current user info |
| GET    | /api/auth/users                 | Admin    | List all users        |
| PATCH  | /api/auth/users/:userId/role    | Admin    | Update user role      |
| GET    | /api/health                     | None     | Health check          |

---

## 🎨 Theme

- Primary color: `#b1f2ff` (light blue)
- Accent: `#0284c7`
- Font: Inter (Google Fonts)
