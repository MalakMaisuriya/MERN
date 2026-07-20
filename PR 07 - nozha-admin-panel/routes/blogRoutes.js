const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { ensureAuthenticated } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", ensureAuthenticated, blogController.dashboard);

router.get("/blogs", ensureAuthenticated, blogController.listBlogs);
router.get("/blogs/new", ensureAuthenticated, blogController.getCreateForm);
router.post("/blogs", ensureAuthenticated, upload.single("image"), blogController.createBlog);
router.get("/blogs/:id/edit", ensureAuthenticated, blogController.getEditForm);
router.put("/blogs/:id", ensureAuthenticated, upload.single("image"), blogController.updateBlog);
router.delete("/blogs/:id", ensureAuthenticated, blogController.deleteBlog);

module.exports = router;
