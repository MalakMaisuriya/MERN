const express = require("express");
const authController = require("../controllers/authController");
const { requireGuest } = require("../middleware/auth");
const { loginRules, registerRules } = require("../validators/authValidator");

const router = express.Router();

router.get("/login", requireGuest, authController.showLogin);
router.post("/login", requireGuest, loginRules, authController.login);
router.get("/register", requireGuest, authController.showRegister);
router.post("/register", requireGuest, registerRules, authController.register);
router.post("/logout", authController.logout);

module.exports = router;
