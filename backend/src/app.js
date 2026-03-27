const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const rsvpRoutes = require('./routes/rsvpRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:4200';
const frontendDistRoot = path.resolve(__dirname, '../../frontend/local-event-micro-planner-app/dist/local-event-micro-planner-app');
const frontendDistPath = fs.existsSync(path.join(frontendDistRoot, 'browser'))
  ? path.join(frontendDistRoot, 'browser')
  : frontendDistRoot;
const hasBuiltFrontend = fs.existsSync(path.join(frontendDistPath, 'index.html'));

app.use(cors({
  origin: [allowedOrigin, 'http://localhost:4200'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Local Event Micro-Planner',
    time: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rsvp', rsvpRoutes);

if (process.env.NODE_ENV === 'production' && hasBuiltFrontend) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
