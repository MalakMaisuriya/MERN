require('dotenv').config();

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

const connectDatabase = require('./config/db');
const buildSessionMiddleware = require('./config/session');
const { setFlashMessages } = require('./src/middleware/flash');
const attachCurrentUser = require('./src/middleware/locals');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');

const publicRoutes = require('./src/routes/publicRoutes');
const authRoutes = require('./src/routes/authRoutes');
const consoleRoutes = require('./src/routes/consoleRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/console');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.set('trust proxy', 1);

app.use(expressLayouts);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(buildSessionMiddleware());
app.use(setFlashMessages);
app.use(attachCurrentUser);

app.use((req, res, next) => {
  res.locals.requestPath = req.path;
  res.locals.currentYear = new Date().getFullYear();
  next();
});

app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/console', consoleRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`LumenPortal running at ${process.env.APP_URL || `http://localhost:${PORT}`}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

module.exports = app;
