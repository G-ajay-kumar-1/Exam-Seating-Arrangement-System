# Complete Command Reference - Automated Exam Seating System

## 📋 Table of Contents
1. [Quick Start Commands](#quick-start)
2. [Root Project Commands](#root-commands)
3. [Server Commands](#server-commands)
4. [Client Commands](#client-commands)
5. [Database Commands](#database-commands)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting Commands](#troubleshooting)
8. [Advanced Commands](#advanced-commands)

---

## 🚀 Quick Start

### **The One Command to Start Everything**
```bash
npm run dev
```
**What it does**: Starts the local MongoDB Windows service when needed, starts the backend (port 5000), verifies its database health, then starts the frontend (port 5173).  
**Requires**: Dependencies installed and configured `server\.env` / `client\.env` files.

### **First Time Setup (Complete)**
```bash
# 1. Navigate to project
cd "IP capstone web"

# 2. Install all dependencies
npm run install:all

# 3. Start the application (starts local MongoDB automatically)
npm run dev
```

Open http://localhost:5173 after the backend health check confirms MongoDB is connected. `npm run seed` is optional and deletes existing app data before loading demo data; do not run it if you need to keep existing records.

### Windows PowerShell, separate terminals

```powershell
cd "C:\Users\gonug\Downloads\IP capstone web"
npm run server
```

```powershell
cd "C:\Users\gonug\Downloads\IP capstone web"
npm run client
```

`npm run dev` starts the local MongoDB Windows service automatically. If starting the service requires administrator permission, run this once from an elevated PowerShell:

```powershell
Start-Service MongoDB
```

Standalone `npm run server` and `npm run seed` commands require MongoDB to be reachable first.

---

## 📦 Root Project Commands

### **Installation**
```bash
npm run install:all
```
**What it does**: Installs dependencies for both server AND client  
**Output**: Installs node_modules in both `/server` and `/client`  
**Recommended**: First time setup or after `node_modules` deletion

### **Start Everything**
```bash
npm run dev
```
**What it does**: Runs backend and frontend concurrently  
**Output**: 
- Backend: `[server] Server running on 5000`
- Frontend: `[client] ➜  Local: http://localhost:5173/`

### **Start Backend Only**
```bash
npm run server
```
**What it does**: Starts Express API server  
**Runs on**: `http://localhost:5000`  
**Shows logs**: From backend only

### **Start Frontend Only**
```bash
npm run client
```
**What it does**: Starts Vite React development server  
**Runs on**: `http://localhost:5173`  
**Includes**: Hot module reloading

### **Build for Production**
```bash
npm run build
```
**What it does**: Creates production build of frontend  
**Output**: Optimized static files in `client/dist`  
**Usage**: Deploy to production server

### **Seed Database (Load Test Data)**
```bash
npm run seed
```
**What it does**: Populates MongoDB with:
- 450 students (90 per branch)
- 50+ exams
- 12 halls
- Admin user

**Creates**: Test data ready for seating generation  
**Clears**: Existing data before loading (be careful!)

---

## 🖥️ Server Commands

Navigate to server directory first:
```bash
cd server
```

### **Start Backend Development Server**
```bash
npm run dev
```
**What it does**: Starts Express server with nodemon (auto-reload)  
**Runs on**: `http://localhost:5000`  
**Auto-reloads**: When code changes

### **Start Backend Production**
```bash
npm start
```
**What it does**: Starts Express server without nodemon  
**Use for**: Production or stable environments  
**No auto-reload**: Changes require manual restart

### **Seed Database (From Server Directory)**
```bash
npm run seed
```
**What it does**: Runs `/seed/demo.js`  
**Creates**:
- Database: `automated_exam_seating`
- 450 Students with realistic data
- 50+ Exams across branches
- 12 Halls in 3 blocks
- Admin user: `admin@college.edu`

### **Check Server Status**
```bash
# From root or server directory
curl http://localhost:5000/api/health
```
**Expected Response**:
```json
{"ok":true,"service":"Automated Exam Seating System"}
```

### **View Server Logs**
```bash
# While server is running, logs show:
[timestamp] GET /api/students - 200
[timestamp] POST /api/allocation/generate - 201
```

---

## 🎨 Client Commands

Navigate to client directory first:
```bash
cd client
```

### **Start Frontend Development Server**
```bash
npm run dev
```
**What it does**: Starts Vite dev server with hot reload  
**Runs on**: `http://localhost:5173`  
**Features**: Instant reload on file changes

### **Build Frontend for Production**
```bash
npm run build
```
**What it does**: Creates optimized production build  
**Output**: `client/dist` folder with:
- Minified JavaScript
- Optimized CSS
- Compressed assets

### **Preview Production Build**
```bash
npm run preview
```
**What it does**: Serves the production build locally  
**Runs on**: `http://localhost:4173`  
**Purpose**: Test production build before deployment

### **Install Client Dependencies**
```bash
npm install
```
**What it does**: Installs packages from client/package.json  
**Use for**: Updating individual packages

---

## 🗄️ Database Commands

### **Start MongoDB (Windows)**
```bash
mongod
```
**Output**:
```
[initandlisten] Listening on 127.0.0.1:27017
```
**Keep running**: In separate terminal

### **Connect to MongoDB Shell (Separate Terminal)**
```bash
mongosh
```
**Commands inside mongosh**:
```javascript
// List databases
show databases

// Use exam seating database
use automated_exam_seating

// Check collections
show collections

// Count students
db.students.countDocuments()

// View one student
db.students.findOne()

// Count all records
db.students.count()
db.exams.count()
db.halls.count()
db.seatingplans.count()
```

### **Clear Database (Delete All Data)**
```bash
mongosh
```
```javascript
use automated_exam_seating
db.dropDatabase()
exit
```
**Warning**: This DELETES all data!

### **Backup Database**
```bash
# From Windows PowerShell
mongodump --db automated_exam_seating --out ./backup
```

### **Restore Database**
```bash
mongorestore --db automated_exam_seating ./backup/automated_exam_seating
```

---

## 🔄 Development Workflow

### **Complete Development Session**

**Terminal 1 - Start Backend**:
```bash
cd "IP capstone web"
cd server
npm run dev
```

**Terminal 2 - Start Frontend**:
```bash
cd "IP capstone web"
cd client
npm run dev
```

**Terminal 3 - Run MongoDB** (if not already running):
```bash
mongod
```

### **Or Use Single Command (Easier)**:
```bash
cd "IP capstone web"
npm run dev
```

### **Hot Reload Development**
- Frontend: Changes to `.jsx` files auto-reload in browser
- Backend: Changes to `.js` files auto-reload (nodemon)
- CSS: Changes to Tailwind CSS auto-apply

### **Edit and Save Workflow**
1. Edit a file (e.g., `client/src/pages/Dashboard.jsx`)
2. Save the file (Ctrl+S)
3. Browser auto-updates within 1 second
4. See changes live without refreshing

---

## 🔧 Troubleshooting Commands

### **Port Already in Use (5000 or 5173)**

**Find process using port 5000**:
```bash
netstat -ano | findstr :5000
```

**Kill process by PID**:
```bash
taskkill /PID <PID_NUMBER> /F
```

**Example**:
```bash
taskkill /PID 1234 /F
```

### **Check All Services Running**
```bash
# Check Backend
netstat -ano | findstr :5000

# Check Frontend
netstat -ano | findstr :5173

# Check MongoDB
netstat -ano | findstr :27017
```

### **Verify MongoDB Connection**
```bash
mongosh
```

If connects successfully, MongoDB is running.

### **Clear npm Cache**
```bash
npm cache clean --force
```
**Use for**: Dependency issues

### **Reinstall Dependencies (Complete Clean)**
```bash
# Remove all node_modules
rmdir /s /q node_modules
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules

# Reinstall everything
npm run install:all
```

### **Check Node/npm Versions**
```bash
node --version
npm --version
```

### **View npm Global Packages**
```bash
npm list -g
```

### **Update npm**
```bash
npm install -g npm@latest
```

---

## 🚀 Advanced Commands

### **Environment Variables Check**

**View server environment**:
```bash
cd server
Get-Content .env
```

**View client environment**:
```bash
cd client
Get-Content .env
```

### **Create Environment File (If Missing)**

**server/.env**:
```bash
$env:MONGODB_URI='mongodb://127.0.0.1:27017/automated_exam_seating'
$env:JWT_SECRET='exam-seating-system-secret-key-2026'
$env:PORT='5000'
$env:CLIENT_URL='http://localhost:5173'
```

### **Run Tests (When Available)**
```bash
npm test
```
*(Note: Test scripts not currently configured)*

### **Lint Code (When Available)**
```bash
npm run lint
```
*(Note: Linting not currently configured)*

### **Upgrade Dependencies**
```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm install package-name@latest
```

### **View Detailed Dependencies**
```bash
npm list --depth=0
```

### **Generate Production Build with Stats**
```bash
cd client
npm run build
```

### **Access MongoDB Atlas (Cloud)**
If using MongoDB Atlas instead of local:
```bash
# Update .env with Atlas URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

---

## 📊 API Commands (Testing)

### **Test Backend Health**
```bash
curl http://localhost:5000/api/health
```

### **Get All Students**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/students
```

### **Create a Student**
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "registerNumber":"TEST001",
    "name":"Test Student",
    "branch":"CSE",
    "year":3,
    "section":"A",
    "email":"test@college.edu"
  }'
```

### **Generate Seating Plan**
```bash
curl -X POST http://localhost:5000/api/allocation/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "examId":"exam123",
    "hallIds":["hall1","hall2"],
    "type":"Theory",
    "timing":"FN"
  }'
```

---

## 🎯 Common Workflows

### **New Developer Setup**
```bash
# 1. Clone/download project
cd "IP capstone web"

# 2. Install everything
npm run install:all

# 3. Ensure MongoDB running (separate terminal)
mongod

# 4. Load test data
npm run seed

# 5. Start development
npm run dev

# 6. Open browser
# http://localhost:5173
```

### **Reset Everything**
```bash
# 1. Stop all services (Ctrl+C)

# 2. Clean install
npm run install:all --force

# 3. Reload seed data
npm run seed

# 4. Restart
npm run dev
```

### **Deploy to Production**
```bash
# 1. Build frontend
npm run build

# 2. Upload client/dist to web server
# 3. Deploy server to Node.js hosting
# 4. Set environment variables on production
# 5. Start production server
npm start
```

### **Debug Backend Issues**
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start backend with logging
npm run server

# Terminal 3: Test API
curl http://localhost:5000/api/health
```

### **Debug Frontend Issues**
```bash
# Open browser DevTools (F12)
# Check Console for errors
# Check Network tab for failed requests
# Check Application tab for localStorage tokens

# Restart frontend
npm run client
```

---

## 📝 Command Summary Table

| Command | Location | Purpose | Runs On |
|---------|----------|---------|---------|
| `npm run dev` | Root | Start everything | Both |
| `npm run server` | Root | Backend only | :5000 |
| `npm run client` | Root | Frontend only | :5173 |
| `npm run install:all` | Root | Install all deps | N/A |
| `npm run seed` | Root | Load test data | Database |
| `npm run build` | Root | Production build | N/A |
| `npm run dev` | Server | Start backend | :5000 |
| `npm start` | Server | Production backend | :5000 |
| `npm run seed` | Server | Seed database | Database |
| `npm run dev` | Client | Start frontend | :5173 |
| `npm run build` | Client | Build frontend | N/A |
| `npm run preview` | Client | Preview build | :4173 |
| `mongod` | System | Start MongoDB | :27017 |
| `mongosh` | System | MongoDB shell | N/A |

---

## ✅ Checklist Before Running

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MongoDB installed and in PATH
- [ ] Project folder exists: `IP capstone web`
- [ ] `.env` files configured
- [ ] No terminal processes using ports 5000, 5173, 27017

---

## 🎉 Success Indicators

When everything is running correctly, you should see:

```
[server] Server running on 5000 ✓
[client] ➜  Local:   http://localhost:5173/ ✓
[MongoDB] listening on 127.0.0.1:27017 ✓
Browser shows: Automated Exam Seating System ✓
```

---

## 💡 Tips

1. **Always run `mongod` first** - Database must be available
2. **Use `npm run dev`** - Easiest way to run everything
3. **Keep terminals open** - Don't close them while developing
4. **Check ports if issues** - Use `netstat -ano | findstr :PORT`
5. **Reload browser if stuck** - Press `Ctrl+Shift+R` for hard refresh
6. **Check console errors** - Press F12 to open DevTools

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-30  
**Status**: Complete
