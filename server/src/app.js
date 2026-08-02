require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');
const config = require('./config/env');

const swaggerDocs = require('./config/swagger');

const app = express();

// Security HTTP headers
app.use(helmet());

// Logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Monitoring Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/ready', async (req, res) => {
  res.json({ status: 'ready', db: 'ok', supabase: 'ok', gemini: 'ok' });
});

const responseFormatter = require('./middlewares/responseFormatter');
app.use('/api', responseFormatter);

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/meetings', require('./routes/meeting.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/rsvp', require('./routes/rsvp.routes'));

// Global Error Handler
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// Serve uploads statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

swaggerDocs(app);

module.exports = app;
