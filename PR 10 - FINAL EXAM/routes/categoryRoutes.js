const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAuth, authorizeRoles } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.post('/delete/:id', authorizeRoles('admin'), categoryController.deleteCategory);

module.exports = router;
