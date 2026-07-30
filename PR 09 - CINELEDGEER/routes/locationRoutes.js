const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authorize = require('../middleware/roleMiddleware');

router.get('/', locationController.index);
router.post('/country', authorize('Admin'), locationController.createCountry);
router.post('/city', authorize('Admin'), locationController.createCity);
router.post('/address', authorize('Admin'), locationController.createAddress);
router.post('/language', authorize('Admin'), locationController.createLanguage);
router.delete('/country/:id', authorize('Admin'), locationController.deleteCountry);
router.delete('/city/:id', authorize('Admin'), locationController.deleteCity);
router.delete('/address/:id', authorize('Admin'), locationController.deleteAddress);
router.delete('/language/:id', authorize('Admin'), locationController.deleteLanguage);

module.exports = router;
