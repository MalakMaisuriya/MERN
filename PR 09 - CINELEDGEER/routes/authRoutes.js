const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidation } = require('../utils/validators');

router.get('/login', authController.loginPage);
router.post('/login', loginValidation, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
