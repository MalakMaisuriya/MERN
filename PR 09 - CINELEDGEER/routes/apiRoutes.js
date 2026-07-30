const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/movies', apiController.getMovies);
router.get('/movies/:id', apiController.getMovieById);
router.post('/movies', apiController.createMovie);
router.put('/movies/:id', apiController.updateMovie);
router.delete('/movies/:id', apiController.deleteMovie);

router.get('/customers', apiController.getCustomers);
router.get('/customers/:id', apiController.getCustomerById);
router.post('/customers', apiController.createCustomer);
router.put('/customers/:id', apiController.updateCustomer);
router.delete('/customers/:id', apiController.deleteCustomer);

router.get('/rentals', apiController.getRentals);
router.post('/rentals', apiController.createRental);
router.put('/rentals/:id/return', apiController.returnRental);

router.get('/payments', apiController.getPayments);

module.exports = router;
