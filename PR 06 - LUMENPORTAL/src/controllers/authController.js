const Account = require('../models/Account');
const { flashSuccess, flashError } = require('../middleware/flash');

const renderSignIn = (req, res) => {
  res.render('auth/sign-in', {
    pageTitle: 'Sign In',
    layout: 'layouts/auth',
    formData: req.body || {},
    fieldErrors: {}
  });
};

const renderSignUp = (req, res) => {
  res.render('auth/sign-up', {
    pageTitle: 'Create Account',
    layout: 'layouts/auth',
    formData: req.body || {},
    fieldErrors: {}
  });
};

const signIn = async (req, res) => {
  if (req.validationErrors) {
    return res.status(422).render('auth/sign-in', {
      pageTitle: 'Sign In',
      layout: 'layouts/auth',
      formData: req.body,
      fieldErrors: req.validationErrors
    });
  }

  const { email, password } = req.body;
  const account = await Account.findOne({ email }).select('+passwordHash');

  if (!account || !account.isActive) {
    flashError(req, 'Invalid credentials or inactive account');
    return res.status(401).render('auth/sign-in', {
      pageTitle: 'Sign In',
      layout: 'layouts/auth',
      formData: req.body,
      fieldErrors: { email: 'Invalid credentials or inactive account' }
    });
  }

  const passwordMatches = await account.verifyPassword(password);

  if (!passwordMatches) {
    flashError(req, 'Invalid credentials');
    return res.status(401).render('auth/sign-in', {
      pageTitle: 'Sign In',
      layout: 'layouts/auth',
      formData: req.body,
      fieldErrors: { password: 'Incorrect password' }
    });
  }

  account.lastLoginAt = new Date();
  await account.save();

  req.session.accountId = account._id.toString();
  flashSuccess(req, `Welcome back, ${account.fullName.split(' ')[0]}`);

  const redirectPath = req.session.returnTo || '/console';
  delete req.session.returnTo;
  return res.redirect(redirectPath);
};

const signUp = async (req, res) => {
  if (req.validationErrors) {
    return res.status(422).render('auth/sign-up', {
      pageTitle: 'Create Account',
      layout: 'layouts/auth',
      formData: req.body,
      fieldErrors: req.validationErrors
    });
  }

  const existingAccount = await Account.findOne({ email: req.body.email });
  if (existingAccount) {
    return res.status(409).render('auth/sign-up', {
      pageTitle: 'Create Account',
      layout: 'layouts/auth',
      formData: req.body,
      fieldErrors: { email: 'An account with this email already exists' }
    });
  }

  const passwordHash = await Account.hashPassword(req.body.password);
  const account = await Account.create({
    fullName: req.body.fullName,
    email: req.body.email,
    passwordHash,
    role: 'editor'
  });

  req.session.accountId = account._id.toString();
  flashSuccess(req, 'Your account has been created successfully');
  return res.redirect('/console');
};

const signOut = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('lumen.sid');
    res.redirect('/auth/sign-in');
  });
};

module.exports = {
  renderSignIn,
  renderSignUp,
  signIn,
  signUp,
  signOut
};
