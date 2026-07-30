const express = require('express');
const { ensureAuthenticated } = require('../middleware/auth');
const { dashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', ensureAuthenticated, dashboard);

module.exports = router;
