const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authorize = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { movieValidation } = require('../utils/validators');

router.get('/', movieController.index);
router.get('/new', authorize('Admin'), movieController.new);
router.post('/', authorize('Admin'), upload.single('poster'), movieValidation, movieController.create);
router.get('/:id', movieController.show);
router.get('/:id/edit', authorize('Admin'), movieController.edit);
router.put('/:id', authorize('Admin'), upload.single('poster'), movieValidation, movieController.update);
router.delete('/:id', authorize('Admin'), movieController.destroy);

module.exports = router;
