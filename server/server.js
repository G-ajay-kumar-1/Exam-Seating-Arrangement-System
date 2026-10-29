import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import Hall from './models/Hall.js';
import { connectDB } from './utils/db.js';
import { createDefaultHallCatalog } from './utils/buildingConfig.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import examRoutes from './routes/examRoutes.js';
import hallRoutes from './routes/hallRoutes.js';
import allocationRoutes from './routes/allocationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import pdfImportRoutes from './routes/pdfImportRoutes.js';
import { initSocket } from './sockets/socket.js';

dotenv.config({ path: new URL('./.env', import.meta.url) });

const app = express();
const server = http.createServer(app);
const configuredClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowOrigin = (origin, callback) => {
  const allowed = !origin
    || origin === configuredClientUrl
    || /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  callback(null, allowed);
};
const io = new Server(server, {
  cors: { origin: allowOrigin, credentials: true }
});

initSocket(io);
app.set('io', io);
app.use(helmet());
app.use(cors({ origin: allowOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    ok: databaseReady,
    service: 'Automated Exam Seating System',
    database: databaseReady ? 'connected' : 'disconnected'
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', pdfImportRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB().then(async () => {
  const defaultHalls = createDefaultHallCatalog();
  const requiredBlocks = [...new Set(defaultHalls.map((hall) => hall.block))];
  const existingHalls = await Hall.find().lean();
  const hasRequiredBlocks = requiredBlocks.every((block) => existingHalls.some((hall) => hall.block === block));

  if (existingHalls.length === 0 || !hasRequiredBlocks) {
    await Hall.deleteMany({});
    await Hall.insertMany(defaultHalls, { ordered: false });
    console.log(`Inserted ${defaultHalls.length} campus halls for: ${requiredBlocks.join(', ')}`);
  }

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the existing backend or change PORT in server/.env.`);
      process.exit(1);
    }
    throw error;
  });
  server.listen(port, () => console.log(`Server running on ${port}`));
}).catch((error) => {
  console.error('Database connection failure:', error.message);
  process.exit(1);
});
