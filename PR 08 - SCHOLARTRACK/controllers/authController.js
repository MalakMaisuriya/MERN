const User = require('../models/User');

const showRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Create Account',
    formData: {}
  });
};

const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(409).render('auth/register', {
        title: 'Create Account',
        formData: req.body,
        errors: [
          {
            msg: existingUser.email === email ? 'Email is already registered.' : 'Username is already taken.'
          }
        ]
      });
    }

    await User.create({ name, username, email, password });
    req.flash('success', 'Account created successfully. Please login.');
    return res.redirect('/auth/login');
  } catch (error) {
    return next(error);
  }
};

const showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    formData: {}
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        formData: { email },
        errors: [{ msg: 'Invalid email or password.' }]
      });
    }

    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email
    };

    req.flash('success', `Welcome back, ${user.name}.`);
    return res.redirect('/dashboard');
  } catch (error) {
    return next(error);
  }
};

const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('connect.sid');
    return res.redirect('/auth/login');
  });
};

module.exports = {
  showRegister,
  register,
  showLogin,
  login,
  logout
};
