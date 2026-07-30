const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { rentalValidation } = require('../utils/validators');

router.get('/', rentalController.index);
router.get('/new', rentalController.new);
router.post('/', rentalValidation, rentalController.create);
router.put('/:id/return', rentalController.returnRental);

module.exports = router;
