import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration (FIX 7)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation: Origin not allowed.'));
    },
    credentials: true
  })
);

// Body Parser Limit (FIX 2)
app.use(express.json({ limit: '10kb' }));

// Rate Limiters (FIX 3)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many chat requests from this IP, please try again after a minute.'
  }
});

const postLeadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many lead submission requests, please try again after a minute.'
  }
});

const getLeadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many lead retrieval requests, please try again after a minute.'
  }
});

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/chat', chatLimiter, chatRoutes);
app.use(
  '/api/leads',
  (req, res, next) => {
    if (req.method === 'POST') return postLeadLimiter(req, res, next);
    if (req.method === 'GET') return getLeadLimiter(req, res, next);
    next();
  },
  leadRoutes
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'AI Business Assistant Backend',
    timestamp: new Date().toISOString()
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not Found', message: `Route ${req.originalUrl} does not exist.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack || err.message || err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: isProd ? 'An unexpected error occurred.' : (err.message || 'An unexpected error occurred.')
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 AI Business Assistant Server running on port ${PORT}`);
  console.log(`📡 Base API Endpoint: http://localhost:${PORT}/api`);
  console.log(`=================================================`);
});
