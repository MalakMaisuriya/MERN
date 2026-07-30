const express = require('express');
const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');
const { handleValidation, registerRules, loginRules } = require('../utils/validation');

const router = express.Router();

router.get('/register', redirectIfAuthenticated, authController.showRegister);
router.post(
  '/register',
  redirectIfAuthenticated,
  registerRules,
  handleValidation('auth/register', { title: 'Create Account' }),
  authController.register
);

router.get('/login', redirectIfAuthenticated, authController.showLogin);
router.post(
  '/login',
  redirectIfAuthenticated,
  loginRules,
  handleValidation('auth/login', { title: 'Login' }),
  authController.login
);

router.post('/logout', authController.logout);

module.exports = router;
