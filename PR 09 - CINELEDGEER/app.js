require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  const flash = req.cookies && req.cookies.flash ? JSON.parse(req.cookies.flash) : null;
  if (req.cookies && req.cookies.flash) {
    res.clearCookie('flash');
  }
  res.locals.flash = flash;
  res.setFlash = (type, message) => {
    res.cookie('flash', JSON.stringify({ type, message }), { maxAge: 10000 });
  };
  res.locals.query = req.query || {};
  res.locals.currentUser = req.user || null;
  next();
});

app.use(require('./routes/authRoutes'));

app.get('/', (req, res) => res.redirect('/dashboard'));
app.use('/dashboard', protect, require('./routes/dashboardRoutes'));
app.use('/movies', protect, require('./routes/movieRoutes'));
app.use('/actors', protect, require('./routes/actorRoutes'));
app.use('/categories', protect, require('./routes/categoryRoutes'));
app.use('/customers', protect, require('./routes/customerRoutes'));
app.use('/inventory', protect, require('./routes/inventoryRoutes'));
app.use('/rentals', protect, require('./routes/rentalRoutes'));
app.use('/payments', protect, require('./routes/paymentRoutes'));
app.use('/stores', protect, require('./routes/storeRoutes'));
app.use('/locations', protect, require('./routes/locationRoutes'));
app.use('/staff', protect, require('./routes/staffRoutes'));
app.use('/api', protect, require('./routes/apiRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Movie Rental Management System running at http://localhost:${PORT}`));
