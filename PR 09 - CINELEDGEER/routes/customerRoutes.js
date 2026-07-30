const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authorize = require('../middleware/roleMiddleware');
const { customerValidation } = require('../utils/validators');

router.get('/', customerController.index);
router.get('/new', customerController.new);
router.post('/', customerValidation, customerController.create);
router.get('/:id', customerController.show);
router.get('/:id/edit', customerController.edit);
router.put('/:id', customerValidation, customerController.update);
router.delete('/:id', authorize('Admin'), customerController.destroy);

module.exports = router;
