const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authorize = require('../middleware/roleMiddleware');

router.get('/', inventoryController.index);
router.get('/new', authorize('Admin'), inventoryController.new);
router.post('/', authorize('Admin'), inventoryController.create);
router.put('/:id/status', inventoryController.updateStatus);
router.delete('/:id', authorize('Admin'), inventoryController.destroy);

module.exports = router;
