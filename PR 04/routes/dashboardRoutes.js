const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", dashboardController.home);
router.get("/dashboard", requireAuth, dashboardController.dashboard);

module.exports = router;
