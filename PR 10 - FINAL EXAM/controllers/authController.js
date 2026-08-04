const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

exports.getRegisterPage = (req, res) => {
  if (req.user) return res.redirect('/tasks');
  res.render('register', {
    title: 'Register',
    error: req.query.error || null,
    success: req.query.success || null
  });
};

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.render('register', {
        title: 'Register',
        error: 'Please fill all fields',
        success: null
      });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.render('register', {
        title: 'Register',
        error: 'Username already exists',
        success: null
      });
    }

    const userRole = role === 'admin' ? 'admin' : 'user';

    const newUser = new User({
      username: username.toLowerCase(),
      password,
      role: userRole
    });

    await newUser.save();
    res.redirect('/auth/login?success=Account created successfully. Please login.');
  } catch (err) {
    console.log(err);
    res.render('register', {
      title: 'Register',
      error: 'Registration failed',
      success: null
    });
  }
};

exports.getLoginPage = (req, res) => {
  if (req.user) return res.redirect('/tasks');
  res.render('login', {
    title: 'Login',
    error: req.query.error || null,
    success: req.query.success || null
  });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('login', {
        title: 'Login',
        error: 'Enter username and password',
        success: null
      });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid credentials',
        success: null
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid credentials',
        success: null
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, { httpOnly: true });
    res.redirect('/tasks');
  } catch (err) {
    console.log(err);
    res.render('login', {
      title: 'Login',
      error: 'Login failed',
      success: null
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
};
