import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes';
import questionRoutes from './routes/question.routes';
import examRoutes from './routes/exam.routes';
import adminRoutes from './routes/admin.routes';
import attemptRoutes from './routes/attempt.routes';
import integrityRoutes from './routes/integrity.routes';
import { errorHandler } from './middleware/error.middleware';

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), 'server/.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const app = express();

// Trust proxy for Cloudflare Tunnel / reverse proxies
app.set('trust proxy', 1);

// Security headers (configured to allow KaTeX fonts & SPA assets)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration (supports custom domains through Cloudflare Tunnel & local dev)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. same-origin, curl, server-to-server) or any configured domain
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // generous limit for CBT test taking
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/questions', apiLimiter, questionRoutes);
app.use('/api/exams', apiLimiter, examRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/attempts', apiLimiter, attemptRoutes);
app.use('/api/integrity', apiLimiter, integrityRoutes);

async function forwardToDiscord(payload: any) {
  const discordUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!discordUrl) return;

  const { event, attemptId, data, integrityFlags, message } = payload;
  const isSuspicious =
    integrityFlags?.screenExited ||
    integrityFlags?.fullscreenExited ||
    (integrityFlags?.cheatingFlags && Object.keys(integrityFlags.cheatingFlags).length > 0);

  const cheatingList =
    integrityFlags?.cheatingFlags && Object.keys(integrityFlags.cheatingFlags).length > 0
      ? Object.keys(integrityFlags.cheatingFlags).join(', ')
      : 'None';

  const embedFields = [
    { name: 'Attempt ID', value: attemptId ? `\`${attemptId}\`` : 'N/A', inline: true },
    { name: 'Device Type', value: integrityFlags?.deviceType || 'unknown', inline: true },
    { name: 'Screen Exited', value: integrityFlags?.screenExited ? '⚠️ Yes' : '✅ No', inline: true },
    { name: 'Fullscreen Exited', value: integrityFlags?.fullscreenExited ? '⚠️ Yes' : '✅ No', inline: true },
    { name: 'Cheating Flags', value: cheatingList, inline: false },
  ];

  if (message || data?.message) {
    embedFields.push({ name: 'Details', value: String(message || data?.message), inline: false });
  }

  const discordBody = {
    username: 'CBT Integrity Monitor',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png',
    embeds: [
      {
        title: `${isSuspicious ? '🚨' : 'ℹ️'} Integrity Alert: ${event || 'Event Triggered'}`,
        color: isSuspicious ? 15158332 : 3447003,
        fields: embedFields,
        timestamp: new Date().toISOString(),
        footer: { text: 'CBT Anti-Cheat Realtime Proctoring' },
      },
    ],
  };

  try {
    await fetch(discordUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordBody),
    });
  } catch (err) {
    console.warn('Failed to forward webhook to Discord:', err);
  }
}

app.post('/api/webhooks', apiLimiter, (req, res) => {
  forwardToDiscord(req.body).catch(() => {});
  res.status(200).json({ status: 'ok', received: req.body });
});

// Static assets & SPA fallback (serves built React frontend from client/dist)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT} (bound to ${HOST})`);
});

export default app;
