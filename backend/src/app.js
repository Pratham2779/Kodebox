import express from 'express';
import { config } from 'dotenv';
config();
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';

// Route imports
import { userRouter } from './routes/user.route.js';
import { authRouter } from './routes/auth.route.js';
import { planRouter } from './routes/plan.route.js';
import { instanceRouter } from './routes/instance.route.js';
import { subscriptionRouter } from './routes/subscription.route.js';
import { razorpayWebhookRouter } from './routes/webhook.route.js';
import { backupRouter } from './routes/backup.route.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middlewares ---

app.use(
  '/api/v1/webhooks/razorpay',
  express.raw({ type: 'application/json' })
);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());

app.use((req, res, next) => {
  if (req.path === '/api/v1/webhooks/razorpay') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve backend public/upload files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));


// --- API Routes ---

app.use('/api/v1/user', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/plans', planRouter);
app.use('/api/v1/instance', instanceRouter);
app.use('/api/v1/subscription', subscriptionRouter);
app.use('/api/v1/webhooks', razorpayWebhookRouter);
app.use('/api/v1/backups', backupRouter);

// Specific 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API Route not found',
  });
});


// --- Frontend Serving ---


const frontendDistPath = path.join(__dirname, '../../frontend/dist');

app.use(express.static(frontendDistPath));


app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});


// --- Global Error Handler ---
app.use(errorHandler);

export { app };