const express = require('express');
const { body } = require('express-validator');
const ops = require('../controllers/operationsController');
const authorize = require('../middleware/roleMiddleware');

const stores = express.Router();
stores.get('/', authorize('Admin'), ops.storesIndex);
stores.get('/new', authorize('Admin'), ops.storeForm);
stores.post('/', authorize('Admin'), body('name').notEmpty(), body('address').isMongoId(), ops.storeSave);
stores.get('/:id', authorize('Admin'), ops.storeShow);
stores.get('/:id/edit', authorize('Admin'), ops.storeForm);
stores.put('/:id', authorize('Admin'), ops.storeSave);
stores.delete('/:id', authorize('Admin'), ops.storeDelete);

const inventory = express.Router();
inventory.get('/', ops.inventoryIndex);
inventory.get('/new', authorize('Admin'), ops.inventoryForm);
inventory.post('/', authorize('Admin'), ops.inventorySave);
inventory.get('/:id/edit', authorize('Admin'), ops.inventoryForm);
inventory.put('/:id', authorize('Admin'), ops.inventorySave);
inventory.put('/:id/status', authorize('Admin', 'Staff'), ops.inventoryStatus);

const rentals = express.Router();
rentals.get('/', ops.rentalsIndex);
rentals.get('/new', ops.rentalForm);
rentals.post('/', [body('customer').isMongoId(), body('inventory').isMongoId(), body('paymentMethod').isIn(['Cash', 'Card', 'UPI'])], ops.rentalCreate);
rentals.put('/:id/return', ops.rentalReturn);

const payments = express.Router();
payments.get('/', ops.paymentsIndex);
payments.get('/new', ops.paymentForm);
payments.post('/', ops.paymentCreate);

const locations = express.Router();
locations.get('/', authorize('Admin'), ops.locationsIndex);
locations.post('/', authorize('Admin'), ops.locationCreate);

const staff = express.Router();
staff.get('/', authorize('Admin'), ops.staffIndex);
staff.get('/new', authorize('Admin'), ops.staffForm);
staff.post('/', authorize('Admin'), ops.staffCreate);

module.exports = { stores, inventory, rentals, payments, locations, staff };
