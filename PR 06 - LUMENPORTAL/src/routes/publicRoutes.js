const express = require('express');
const publicController = require('../controllers/publicController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(publicController.showHome));
router.get('/explore', asyncHandler(publicController.listPublished));
router.get('/read/:slug', asyncHandler(publicController.showPublication));

module.exports = router;
