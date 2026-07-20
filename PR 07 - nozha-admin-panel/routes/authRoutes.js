const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { forwardAuthenticated, ensureAuthenticated } = require("../middleware/auth");

router.get("/register", forwardAuthenticated, authController.getRegister);
router.post("/register", forwardAuthenticated, authController.postRegister);

router.get("/login", forwardAuthenticated, authController.getLogin);
router.post("/login", forwardAuthenticated, authController.postLogin);

router.get("/logout", authController.logout);

// Forgot password (must NOT be logged in) - simple, no email, direct reset by email match
router.get("/forgot-password", forwardAuthenticated, authController.getForgotPassword);
router.post("/forgot-password", forwardAuthenticated, authController.postForgotPassword);

router.get("/verify-otp", forwardAuthenticated, authController.getVerifyOtp);
router.post("/verify-otp", forwardAuthenticated, authController.postVerifyOtp);

// Change password (must be logged in) - form lives on the Profile page
router.post("/change-password", ensureAuthenticated, authController.postChangePassword);

module.exports = router;
