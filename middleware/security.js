const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const WINDOW_MS = 60 * 1000;
const MAX_GENERATE = 15;
const MAX_API = 60;

const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_API,
  message: { error: 'Too many requests. Try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_GENERATE,
  message: { error: 'Too many links generated. Try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function applySecurity(app) {
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use('/api/', apiLimiter);
  app.use('/api/generate', generateLimiter);
}

module.exports = { applySecurity };
