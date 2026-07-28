const express = require('express');
const authController = require('../controllers/authController');
const { requireGuest } = require('../middleware/auth');
const { signInRules, signUpRules } = require('../validators/rules');
const handleValidation = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/sign-in', requireGuest, authController.renderSignIn);
router.post('/sign-in', requireGuest, signInRules, handleValidation, asyncHandler(authController.signIn));

router.get('/sign-up', requireGuest, authController.renderSignUp);
router.post('/sign-up', requireGuest, signUpRules, handleValidation, asyncHandler(authController.signUp));

router.post('/sign-out', authController.signOut);

module.exports = router;
