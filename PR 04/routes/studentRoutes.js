const express = require("express");
const studentController = require("../controllers/studentController");
const { requireAuth } = require("../middleware/auth");
const { studentRules } = require("../validators/studentValidator");

const router = express.Router();

router.use(requireAuth);

router.get("/", studentController.index);
router.get("/new", studentController.create);
router.post("/", studentRules, studentController.store);
router.get("/:id", studentController.show);
router.get("/:id/edit", studentController.edit);
router.put("/:id", studentRules, studentController.update);
router.delete("/:id", studentController.destroy);

module.exports = router;
