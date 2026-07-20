const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { ensureAuthenticated } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/profile", ensureAuthenticated, profileController.getProfile);
router.post("/profile", ensureAuthenticated, profileController.updateProfile);
router.post("/profile/photo", ensureAuthenticated, upload.single("avatar"), profileController.updateAvatar);

module.exports = router;
