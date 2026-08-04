require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/database');

const bodyParser = require('body-parser');
const { authenticateToken } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Connect Database
connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authenticateToken);

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/categories', categoryRoutes);

app.get('/logout', (req, res) => {
  res.redirect('/auth/logout');
});

app.get('/', (req, res) => {
  if (req.user) {
    res.redirect('/tasks');
  } else {
    res.redirect('/auth/login');
  }
});

app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
