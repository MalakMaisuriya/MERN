const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { paymentValidation } = require('../utils/validators');

router.get('/', paymentController.index);
router.get('/new', paymentController.new);
router.post('/', paymentValidation, paymentController.create);

module.exports = router;
