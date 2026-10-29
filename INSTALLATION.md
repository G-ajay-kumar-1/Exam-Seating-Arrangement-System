# Automated Exam Seating System

**A Complete Full-Stack Web Application for Intelligent Examination Seat Allocation**

SIMATS Engineering | Saveetha Institute of Medical and Technical Sciences

---

## 🎯 Overview

This is a production-ready, full-stack web application that automates the allocation of examination seating arrangements while preventing same-branch student clustering. The system intelligently allocates seats using advanced algorithms, provides real-time updates, and generates comprehensive reports.

### Key Features

- ✅ **Intelligent Seat Allocation**: Smart branch-aware algorithms with conflict detection
- ✅ **Real-Time Updates**: WebSocket integration for live data synchronization
- ✅ **Multiple Exam Types**: Theory exams, lab exams, and government examinations
- ✅ **Comprehensive Reports**: Export to CSV, Excel, and PDF formats
- ✅ **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ✅ **User Authentication**: JWT-based admin login and security
- ✅ **CSV Import**: Bulk student data import with validation
- ✅ **Branch-Conflict Prevention**: Minimizes same-branch adjacency
- ✅ **Seating Visualization**: Interactive grid-based seating display
- ✅ **Audit Logging**: Track all allocation decisions

---

## 📋 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.IO** - Real-time updates
- **Multer** - File upload handling
- **XLSX & csv-parser** - Data import
- **PDFKit** - PDF generation

### Architecture
- **REST API** - RESTful API design
- **Modular Services** - Separation of concerns
- **Middleware Pattern** - Authentication and error handling
- **Event-Driven** - Socket.IO events for real-time sync

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v22.13 or higher, or v24)
- **MongoDB** - local or Atlas
- **npm** (bundled with Node.js)

### Installation

#### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd "IP capstone web"

# Install root, backend, and frontend dependencies
npm run install:all
```

#### 2. Configure Environment

Create the runtime environment files from their templates (PowerShell; this does not overwrite existing files):
```bash
if (-not (Test-Path server\.env)) { Copy-Item server\.env.example server\.env }
if (-not (Test-Path client\.env)) { Copy-Item client\.env.example client\.env }
```

The backend reads `server\.env`; the frontend reads `client\.env`. For MongoDB Atlas, set its connection string as `MONGODB_URI` in `server\.env`. For local MongoDB, the example URI uses `127.0.0.1:27017`.

#### 3. Start MongoDB

Start the local MongoDB service, or configure and use a reachable Atlas database. MongoDB must be available before seeding or starting the backend.

#### 4. Seed Demo Data (Optional)

```powershell
npm run seed
```

Seeding **deletes existing app data** in the database selected by `MONGODB_URI` and then creates:
- 450 test students across 5 branches
- 50 exam records
- 12 examination halls
- Admin login: `admin@college.edu` / `Admin@123`

#### 5. Start Application

```powershell
# Start both frontend and backend
npm run dev

# Or start separately:
npm run server
npm run client
```

The combined `npm run dev` starts the frontend once the backend health endpoint confirms MongoDB is connected. Open `http://localhost:5173`; verify the API/database at `http://localhost:5000/api/health`.

---

## 📱 Application Structure

### Modules

#### Module 1: Student & Examination Data Management
- **Pages**: Students, Exams, ImportStudents
- **Features**:
  - Add/Edit/Delete students
  - Bulk CSV import with validation
  - Create and manage examinations
  - Support for multiple exam types

#### Module 2: Examination Hall & Seat Management
- **Pages**: Halls
- **Features**:
  - Create exam halls with configurable dimensions
  - Automatic seat generation
  - Hall capacity management
  - Block and room organization

#### Module 3: Intelligent Seat Allocation
- **Pages**: Allocation
- **Features**:
  - Smart allocation algorithm
  - Branch conflict detection and resolution
  - Multiple hall selection
  - Real-time algorithm feedback
  - Seating grid visualization

#### Module 4: Seating Verification & Administration
- **Features**:
  - Automatic validation of seating plans
  - Conflict reporting
  - Approval workflow
  - Allocation history

#### Module 5: Report Generation & Export
- **Pages**: Reports
- **Features**:
  - Comprehensive seating reports
  - Search and filter capabilities
  - Export to CSV, Excel, PDF
  - Print-friendly formatting
  - Hall-wise and branch-wise reports

---

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/login          # Admin login
POST   /api/auth/register       # Create admin account
```

### Students
```
GET    /api/students            # List all students (paginated)
POST   /api/students            # Create student
PUT    /api/students/:id        # Update student
DELETE /api/students/:id        # Delete student
POST   /api/students/import     # Bulk import via CSV/Excel
```

### Exams
```
GET    /api/exams               # List all exams
POST   /api/exams               # Create exam
PUT    /api/exams/:id           # Update exam
DELETE /api/exams/:id           # Delete exam
```

### Halls & Seats
```
GET    /api/halls               # List all halls
POST   /api/halls               # Create hall
PUT    /api/halls/:id           # Update hall
DELETE /api/halls/:id           # Delete hall
```

### Allocation
```
POST   /api/allocation/generate # Generate seating plan
GET    /api/allocation/:examId  # Get allocation for exam
POST   /api/allocation/regenerate # Regenerate seating
GET    /api/allocation/:examId/validate # Validate seating
```

### Reports
```
GET    /api/reports/export/csv/:examId    # Export as CSV
GET    /api/reports/export/excel/:examId  # Export as Excel
GET    /api/reports/export/pdf/:examId    # Export as PDF
```

### Dashboard
```
GET    /api/dashboard/stats     # Get dashboard statistics
```

---

## 🧠 Allocation Algorithm

### How It Works

1. **Input Collection**
   - Fetches students from database
   - Retrieves available hall capacities
   - Collects branch information

2. **Student Organization**
   - Groups students by branch
   - Shuffles within groups for randomization
   - Interleaves branches to prevent clustering

3. **Intelligent Assignment**
   - Uses greedy algorithm for initial placement
   - Scores each seat based on neighboring branches
   - Prioritizes seats with minimum conflicts

4. **Conflict Optimization**
   - Detects same-branch adjacencies
   - Performs student swaps when beneficial
   - Uses backtracking for difficult scenarios

5. **Validation**
   - Ensures no duplicate allocations
   - Verifies capacity constraints
   - Reports conflict statistics

### Complexity
- Time: O(n log n) where n = number of students
- Space: O(n) for allocation tracking

---

## 🔐 Security Features

- ✅ **JWT Authentication**: Secure admin login
- ✅ **Password Hashing**: bcryptjs with salt rounds
- ✅ **Protected Routes**: Middleware-based access control
- ✅ **Input Validation**: Server-side validation for all inputs
- ✅ **CORS Configuration**: Restricted to trusted origins
- ✅ **Helmet.js**: Security headers
- ✅ **Rate Limiting**: Available for authentication endpoints
- ✅ **Environment Variables**: No hardcoded credentials

---

## 📊 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: String (enum: ['admin']),
  createdAt: Date
}
```

### Student
```javascript
{
  registerNumber: String (unique),
  name: String,
  branch: String (indexed),
  year: Number,
  section: String,
  email: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Exam
```javascript
{
  name: String,
  type: String (enum: ['Theory Exam', 'Lab Exam', 'Other']),
  subject: String,
  date: Date,
  startTime: String,
  endTime: String,
  academicYear: String,
  semester: String,
  status: String (enum: ['Scheduled', 'Completed', 'Cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

### Hall
```javascript
{
  name: String,
  roomNumber: String,
  block: String,
  floor: Number,
  rows: Number,
  columns: Number,
  capacity: Number (calculated),
  createdAt: Date,
  updatedAt: Date
}
```

### SeatingPlan
```javascript
{
  examId: ObjectId (ref: Exam),
  hallId: ObjectId (ref: Hall),
  studentId: ObjectId (ref: Student),
  registerNumber: String (indexed),
  studentName: String,
  seatNumber: String,
  row: Number,
  column: Number,
  branch: String (indexed),
  block: String,
  status: String (enum: ['occupied']),
  conflict: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing

### Manual Testing Workflow

1. **Login**
   - Navigate to `http://localhost:5173`
   - Click "Admin Login"
   - Use credentials: `admin@college.edu` / `Admin@123`

2. **Add Students**
   - Go to Students page
   - Use CSV import to add bulk students
   - Or manually add individual students

3. **Create Exam**
   - Navigate to Exams
   - Create new theory/lab exam
   - Set date and timing

4. **Setup Halls**
   - Go to Halls page
   - Create multiple halls with different capacities
   - Specify rows and columns

5. **Generate Seating**
   - Navigate to Allocation
   - Select exam and halls
   - Click "Generate Seating Plan"
   - View visualization

6. **Export Reports**
   - Go to Reports
   - Select exam
   - Export as CSV, Excel, or PDF

### Test Data
The seed script creates:
- **450 students** distributed across 5 branches
- **50+ exams** with multiple timings
- **12 examination halls** across 3 blocks
- **Total capacity**: 400+ seats

---

## 🚨 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Ensure MongoDB is running
mongod

# Or use MongoDB Atlas
# Update MONGODB_URI in .env to your Atlas connection string
```

### "Port 5000 already in use"
```bash
# Change PORT in server/.env or kill the process
lsof -ti:5000 | xargs kill -9
```

### "CORS errors"
```bash
# Ensure CLIENT_URL in server/.env matches your frontend URL
CLIENT_URL=http://localhost:5173
```

### "CSV import fails"
```bash
# Ensure CSV has columns: Register Number, Name, Branch
# For bulk import: use Excel (.xlsx) or UTF-8 encoded CSV
```

---

## 📈 Performance Optimization

- ✅ **Database Indexing**: On frequently queried fields
- ✅ **Pagination**: For large datasets (students, seating plans)
- ✅ **Lazy Loading**: Seating grids loaded on-demand
- ✅ **Caching**: Dashboard stats cached
- ✅ **Compression**: Gzip enabled on responses

---

## 📝 File Structure

```
IP capstone web/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Allocation.jsx      # Seat allocation
│   │   │   ├── Reports.jsx         # Reports & export
│   │   │   ├── Dashboard.jsx       # Admin dashboard
│   │   │   ├── Students.jsx        # Student management
│   │   │   ├── Exams.jsx           # Exam management
│   │   │   ├── Halls.jsx           # Hall management
│   │   │   └── ...
│   │   ├── components/             # Reusable components
│   │   ├── context/                # React context
│   │   ├── services/               # API services
│   │   ├── hooks/                  # Custom hooks
│   │   ├── layouts/                # Layout components
│   │   └── main.jsx                # App entry point
│   └── package.json
├── server/                          # Express backend
│   ├── controllers/                # Business logic
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── allocationController.js
│   │   ├── reportController.js
│   │   └── ...
│   ├── models/                     # Mongoose schemas
│   ├── routes/                     # Express routes
│   ├── services/                   # Service layer
│   │   └── allocation/             # Allocation algorithms
│   ├── middleware/                 # Custom middleware
│   ├── utils/                      # Utilities
│   ├── sockets/                    # Socket.IO setup
│   ├── seed/                       # Database seeding
│   ├── server.js                   # Entry point
│   └── package.json
├── .env                            # Root environment
├── package.json                    # Root package
└── README.md                       # This file
```

---

## 🎓 Allocation Algorithm Details

### Branch Conflict Detection
The algorithm checks 4-directional neighbors (up, down, left, right) for same-branch adjacency:

```
Example Grid:
┌─────┬─────┬─────┐
│ CSE │ ECE │ CSE │  ✗ Conflict: CSE-CSE
├─────┼─────┼─────┤
│ ECE │ CSE │ ECE │  ✓ No conflict
├─────┼─────┼─────┤
│MECH │ CSE │MECH │  ✓ No conflict
└─────┴─────┴─────┘
```

### Optimization Strategies
1. **Interleaving**: Students from different branches are mixed during shuffling
2. **Greedy Scoring**: Each seat gets a conflict score (0 = best)
3. **Backtracking**: If stuck, algorithm resets and tries different approaches
4. **Swapping**: Adjacent students can be swapped if it reduces conflicts

---

## 🔄 Real-Time Synchronization

The system uses Socket.IO for real-time updates:

```javascript
// Events emitted by server:
- student:created
- student:updated
- student:deleted
- exam:created
- hall:created
- allocation:started
- allocation:completed
- verification:completed
```

Connected admins see changes instantly without page refresh.

---

## 📧 Support & Documentation

For detailed documentation on specific modules, see:
- **Allocation Algorithm**: `/server/services/allocation/README.md`
- **API Reference**: View Postman collection in `/docs/`
- **Database Queries**: See MongoDB query patterns in `/docs/queries.md`

---

## 📄 License

This project is created for SIMATS Engineering, Saveetha Institute of Medical and Technical Sciences.

---

## 👥 Authors

**Capstone Project Team**
- Development & Architecture
- Database Design
- Algorithm Implementation
- Full-Stack Integration

---

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Invigilator allocation
- [ ] Real-time conflict resolution
- [ ] ML-based seating optimization
- [ ] Integration with college ERP
- [ ] QR code based seat verification
- [ ] Accessibility improvements

---

## ⚠️ Important Notes

1. **Backup Data**: Always backup MongoDB before running migrations
2. **Seed Data**: Running seed script clears existing data
3. **Allocation**: Cannot be reversed - allocate carefully
4. **Scale Testing**: Tested with 450+ students and 12+ halls
5. **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-30  
**Status**: Production Ready
