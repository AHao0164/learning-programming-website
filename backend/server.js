const crypto = require('crypto');
if (!globalThis.crypto) globalThis.crypto = crypto;
if (!global.crypto) global.crypto = crypto;

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http'); 
const { Server } = require('socket.io');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

dotenv.config();

connectDB();

const app = express();

app.set('trust proxy', 1);

const server = http.createServer(app);

const allowedOrigins = [
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : []),
    process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    socket.on('join_lesson', (lessonId) => {
        socket.join(lessonId);
    });

    socket.on('join_user_room', (userId) => {
        socket.join(userId.toString());
    });

    socket.on('disconnect', () => {});
});

// --- MIDDLEWARES ---
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Allow localhost for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false // Disable for development
}));


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1000,
    message: { success: false, message: 'Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 10 phút!' }
});
app.use('/api/', limiter);

app.use(hpp());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
// Handle favicon.ico to prevent 403 errors
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI Coding Platform API' });
});

const routes = require('./routes/index.routes');
app.use('/api/v1', routes);

// --- ERROR HANDLING ---
// 1. CORS Error Handler
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS not allowed'
        });
    }
    next(err);
});

// 2. 404 Not Found
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// 3. Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

require('./queue/judgeWorker');