import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Import local configurations and routes
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import machineRoutes from './src/routes/machines.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Why createServer(app)?
 * We use the built-in Node 'http' module to create a server and pass our Express app to it.
 * This is necessary because Socket.io needs to hook into the same HTTP server instance 
 * to handle WebSocket protocol upgrades, which Express's app.listen() hides internally.
 */
const httpServer = createServer(app);

/**
 * Socket.io Initialization
 * We attach Socket.io to the httpServer and configure CORS 
 * so the frontend (running on port 5173) can communicate with it.
 */
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
/**
 * CORS (Cross-Origin Resource Sharing)
 * This allows our frontend domain to make API requests to this backend.
 * Without this, the browser would block requests for security reasons.
 */
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json()); // Parses incoming JSON payloads

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);

/**
 * Socket.io Events
 * The 'connection' event fires whenever a frontend client initializes a socket connection.
 * This is where we can set up real-time listeners for specific users or rooms.
 */
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Database Connection & Server Start
const startServer = async () => {
  try {
    // Ensure MongoDB is connected before the server accepts any requests
    await connectDB();
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1); // Exit process with failure
  }
};

startServer();