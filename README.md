# Automated Exam Seating System

A full-stack exam seating management system built with React, Vite, Node.js, Express, MongoDB, and Socket.IO.

## Requirements

- Node.js 22.13+ (or Node.js 24+) and npm
- MongoDB running locally, or a MongoDB Atlas connection string

## First-time setup (Windows PowerShell)

From the project directory:

```powershell
npm run install:all
if (-not (Test-Path server\.env)) { Copy-Item server\.env.example server\.env }
if (-not (Test-Path client\.env)) { Copy-Item client\.env.example client\.env }
```

The backend reads `server\.env`; the frontend reads `client\.env`. Keep the defaults for local MongoDB. For Atlas, set `MONGODB_URI` in `server\.env` to your Atlas connection string and ensure your IP is allowed in the Atlas network access rules.

Start the application from the project directory:

```powershell
npm run dev
```

On Windows, `npm run dev` starts the MongoDB service automatically when `server\.env` uses a local MongoDB URI, then starts the backend and waits for its database health check before starting the frontend. If starting the MongoDB service requires administrator permission, open PowerShell as Administrator and run `Start-Service MongoDB`, then run `npm run dev` from a regular terminal.

For MongoDB Atlas or another non-local database, ensure its URI in `server\.env` is reachable and allowed by its network access rules. The backend health check still blocks frontend startup until the database connection succeeds.

Open [http://localhost:5173](http://localhost:5173). The API base URL is [http://localhost:5000/api](http://localhost:5000/api); check both the API and MongoDB connection with:

```powershell
curl.exe http://localhost:5000/api/health
```

The health response should include `"ok":true` and `"database":"connected"`. The frontend API and Socket.IO URLs are configured in `client\.env` (`VITE_API_URL` and `VITE_SOCKET_URL`).

The API base URL is `http://localhost:5000/api`. The backend exposes these route groups:

- `/auth` — registration, login, and current-user lookup
- `/students` — student management, imports, and exports
- `/exams` and `/halls` — exam and hall management
- `/allocation` — generate, regenerate, inspect, and validate seat allocations
- `/search` — student lookup
- `/reports` — PDF, Excel, and CSV reports
- `/dashboard` — dashboard statistics
- `/health` — API and MongoDB connection status

If using the seeded demo account, load demo data into the configured database:

```powershell
npm run seed
```

**Warning:** seeding deletes existing app data in the database selected by `MONGODB_URI` before adding demo data. Skip this step if you need to preserve data.

## Demo login

The demo account is created by `npm run seed`:

- Email: `admin@college.edu`
- Password: `Admin@123`

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run install:all` | Install root, backend, and frontend dependencies |
| `npm run dev` | Start backend and frontend together |
| `npm run server` | Start only the backend |
| `npm run client` | Start only the frontend |
| `npm run seed` | Replace app data with demo records |
| `npm test --prefix server` | Run backend tests |
| `npm run build` | Build the frontend for production |

See [INSTALLATION.md](./INSTALLATION.md) and [COMMANDS.md](./COMMANDS.md) for more detail.
