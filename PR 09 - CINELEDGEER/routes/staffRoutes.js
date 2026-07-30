const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authorize = require('../middleware/roleMiddleware');
const { staffValidation } = require('../utils/validators');

router.get('/', authorize('Admin'), staffController.index);
router.get('/new', authorize('Admin'), staffController.new);
router.post('/', authorize('Admin'), staffValidation, staffController.create);
router.get('/:id/edit', authorize('Admin'), staffController.edit);
router.put('/:id', authorize('Admin'), staffController.update);
router.delete('/:id', authorize('Admin'), staffController.destroy);

module.exports = router;
