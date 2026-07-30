const { validationResult } = require('express-validator');
const User = require('../models/User');
const { createToken } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/helpers');

exports.loginPage = (req, res) => res.render('auth/login', { title: 'Login', errors: [], email: '' });

exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).render('auth/login', { title: 'Login', errors: errors.array(), email: req.body.email });

  const user = await User.findOne({ email: req.body.email.toLowerCase(), active: true }).select('+password');
  if (!user || !(await user.matchPassword(req.body.password))) {
    return res.status(401).render('auth/login', { title: 'Login', errors: [{ msg: 'Invalid email or password' }], email: req.body.email });
  }

  res.cookie('token', createToken(user), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.redirect('/dashboard');
});

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
