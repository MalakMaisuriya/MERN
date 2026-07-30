const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authorize = require('../middleware/roleMiddleware');
const { storeValidation } = require('../utils/validators');

router.get('/', storeController.index);
router.get('/new', authorize('Admin'), storeController.new);
router.post('/', authorize('Admin'), storeValidation, storeController.create);
router.get('/:id', storeController.show);
router.get('/:id/edit', authorize('Admin'), storeController.edit);
router.put('/:id', authorize('Admin'), storeValidation, storeController.update);
router.delete('/:id', authorize('Admin'), storeController.destroy);

module.exports = router;
