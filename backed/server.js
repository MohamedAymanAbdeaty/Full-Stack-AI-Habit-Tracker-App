import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Database & Route Imports
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import habitRoutes from './routes/habits.js';
import logRoutes from './routes/logs.js';
import aiRoutes from './routes/ai.js';

// Middleware Imports
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ==========================================
// CORS CONFIGURATION
// ==========================================
// Allows multiple origins via comma-separated env variable
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    
    // 2. Allow all localhost ports for local development using Regex
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    
    // 3. Allow explicitly whitelisted production domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // 4. Reject everything else
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies/auth headers
};

// ==========================================
// CORE MIDDLEWARE
// ==========================================
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle pre-flight requests

// Parse JSON bodies with a size limit to prevent abuse/overload
app.use(express.json({ limit: '10kb' }));

// ==========================================
// API ROUTES
// ==========================================
// Health check route for uptime monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Mount feature routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================
// Custom middleware for 404 Not Found (must be after all routes)
app.use(notFound);

// Global error handler (must be the very last middleware)
app.use(errorHandler);

// ==========================================
// SERVER STARTUP
// ==========================================
const startServer = async () => {
  try {
    // Wait for MongoDB connection before accepting requests
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1); 
  }
};

startServer();