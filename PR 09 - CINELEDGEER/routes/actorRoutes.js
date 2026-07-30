const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');
const authorize = require('../middleware/roleMiddleware');
const { actorValidation } = require('../utils/validators');

router.get('/', actorController.index);
router.get('/new', authorize('Admin'), actorController.new);
router.post('/', authorize('Admin'), actorValidation, actorController.create);
router.get('/:id', actorController.show);
router.get('/:id/edit', authorize('Admin'), actorController.edit);
router.put('/:id', authorize('Admin'), actorValidation, actorController.update);
router.delete('/:id', authorize('Admin'), actorController.destroy);

module.exports = router;
