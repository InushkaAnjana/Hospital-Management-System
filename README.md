# CarePulse — Hospital Management System (HMS)

A full-stack, enterprise-grade Hospital Management System built with the **MERN** stack (MongoDB Atlas, Express.js, React.js, Node.js).

---

## 🏗️ Project Architecture & Directory Structure

```
hospital-management-system/
├── backend/
│   ├── src/
│   │   ├── config/             # MongoDB Atlas connection & configurations
│   │   │   └── db.js
│   │   ├── controllers/        # Request controllers
│   │   │   └── healthController.js
│   │   ├── middleware/         # Error handling, auth & 404 middleware
│   │   │   ├── errorHandler.js
│   │   │   └── notFoundHandler.js
│   │   ├── models/             # Mongoose schemas & data models
│   │   │   └── index.js
│   │   ├── routes/             # RESTful API route definitions
│   │   │   ├── healthRoutes.js
│   │   │   └── index.js
│   │   ├── services/           # Business logic & diagnostics
│   │   │   └── healthService.js
│   │   ├── validators/         # Input validation schemas
│   │   │   └── index.js
│   │   ├── utils/              # Response formatters & logger utilities
│   │   │   ├── apiResponse.js
│   │   │   └── logger.js
│   │   ├── app.js              # Express app & middleware configuration
│   │   └── server.js           # Server bootstrap & process lifecycle
│   ├── .env                    # Local environment variables
│   ├── .env.example            # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI & diagnostic components
│   │   │   ├── common/         # Header, Footer, StatusBadge
│   │   │   └── health/         # HealthCard diagnostics
│   │   ├── layouts/            # Application layouts (MainLayout)
│   │   ├── pages/              # View pages (HomePage, NotFoundPage)
│   │   ├── routes/             # React Router route registry (AppRoutes)
│   │   ├── services/           # Axios HTTP API services (api, healthService)
│   │   ├── hooks/              # Custom React hooks (useHealth)
│   │   ├── context/            # Global context providers (AuthContext)
│   │   ├── utils/              # Constants & formatters
│   │   ├── App.jsx             # Top-level React App component
│   │   ├── main.jsx            # DOM mount point
│   │   └── index.css           # Modern design system styling
│   ├── .env                    # Frontend environment variables
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js          # Vite config with backend proxy
│   └── package.json
│
├── .env.example                # Root environment template
├── .gitignore                  # Git ignore rules
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on v22.17.0)
- **npm**: v9+ (tested on 10.9.2)
- **MongoDB Atlas** account / cluster

---

### Backend Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` (already created with your MongoDB Atlas URI):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.d6fxrlw.mongodb.net/Hospital_Management_System?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=8h
   CLIENT_URL=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   Or run directly:
   ```bash
   npm start
   ```
5. Test the Health Check API:
   ```bash
   curl http://localhost:5000/api/health
   ```

---

### Frontend Setup

1. Open a second terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

The application will automatically verify connection to the backend and display live diagnostics for MongoDB Atlas.

---

## 🩺 Health Check API Specification

- **Endpoint**: `GET /api/health`
- **Access**: Public
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "Hospital Management System API is healthy",
    "data": {
      "status": "UP",
      "system": "Hospital Management System API",
      "version": "1.0.0",
      "environment": "development",
      "uptimeSeconds": 46,
      "database": {
        "status": "Connected",
        "connected": true,
        "host": "ac-agauv1x-shard-00-00.d6fxrlw.mongodb.net",
        "name": "Hospital_Management_System"
      },
      "memoryUsageMb": {
        "rss": "64.22",
        "heapTotal": "21.70",
        "heapUsed": "18.95"
      }
    },
    "timestamp": "2026-09-13T17:43:46.164Z"
  }
  ```

---

## 📋 Implementation Roadmap

- [x] **Phase 1: Project Initialization & Health Verification**
- [ ] **Phase 2: Authentication, User Roles & Master Data (Doctors, Departments, Patients, Appointments)**
- [ ] **Phase 3: Inpatient (IPD) & Bed Management**
- [ ] **Phase 4: Electronic Medical Records (EMR) & Diagnostics (Lab)**
- [ ] **Phase 5: Pharmacy Management & Prescription Dispensing**
- [ ] **Phase 6: Billing & Invoicing System**
- [ ] **Phase 7: Staff Management & Attendance**
- [ ] **Phase 8: Reports, Visualizations & Recharts Dashboards**
- [ ] **Phase 9: Audit Logs & Automated Backup System**
- [ ] **Phase 10: End-to-End Testing & Deployment**
