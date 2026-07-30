const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authorize = require('../middleware/roleMiddleware');
const { categoryValidation } = require('../utils/validators');

router.get('/', categoryController.index);
router.get('/new', authorize('Admin'), categoryController.new);
router.post('/', authorize('Admin'), categoryValidation, categoryController.create);
router.get('/:id/edit', authorize('Admin'), categoryController.edit);
router.put('/:id', authorize('Admin'), categoryValidation, categoryController.update);
router.delete('/:id', authorize('Admin'), categoryController.destroy);

module.exports = router;
