const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const topicController = require('../controllers/topicController');
const publicationController = require('../controllers/publicationController');
const mediaController = require('../controllers/mediaController');
const accountController = require('../controllers/accountController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { topicRules, publicationRules, mongoIdParam, listQueryRules } = require('../validators/rules');
const handleValidation = require('../middleware/validate');
const { singleImageUpload } = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(dashboardController.showDashboard));

router.get('/topics', listQueryRules, handleValidation, asyncHandler(topicController.listTopics));
router.get('/topics/new', requireRole('administrator', 'editor'), topicController.showCreateForm);
router.post('/topics', requireRole('administrator', 'editor'), topicRules, handleValidation, asyncHandler(topicController.createTopic));
router.get('/topics/:id/edit', requireRole('administrator', 'editor'), mongoIdParam('id'), handleValidation, asyncHandler(topicController.showEditForm));
router.put('/topics/:id', requireRole('administrator', 'editor'), mongoIdParam('id'), topicRules, handleValidation, asyncHandler(topicController.updateTopic));
router.delete('/topics/:id', requireRole('administrator'), mongoIdParam('id'), handleValidation, asyncHandler(topicController.deleteTopic));

router.get('/publications', listQueryRules, handleValidation, asyncHandler(publicationController.listPublications));
router.get('/publications/new', requireRole('administrator', 'editor'), asyncHandler(publicationController.showCreateForm));
router.post(
  '/publications',
  requireRole('administrator', 'editor'),
  singleImageUpload('coverImage'),
  publicationRules,
  handleValidation,
  asyncHandler(publicationController.createPublication)
);
router.get('/publications/:id/edit', requireRole('administrator', 'editor'), mongoIdParam('id'), handleValidation, asyncHandler(publicationController.showEditForm));
router.put(
  '/publications/:id',
  requireRole('administrator', 'editor'),
  mongoIdParam('id'),
  singleImageUpload('coverImage'),
  publicationRules,
  handleValidation,
  asyncHandler(publicationController.updatePublication)
);
router.delete('/publications/:id', requireRole('administrator', 'editor'), mongoIdParam('id'), handleValidation, asyncHandler(publicationController.deletePublication));

router.get('/media', asyncHandler(mediaController.listMedia));
router.post('/media', requireRole('administrator', 'editor'), singleImageUpload('asset'), asyncHandler(mediaController.uploadMedia));
router.delete('/media/:id', requireRole('administrator', 'editor'), mongoIdParam('id'), handleValidation, asyncHandler(mediaController.deleteMedia));

router.get('/profile', asyncHandler(accountController.showProfile));
router.put('/profile', singleImageUpload('avatar'), asyncHandler(accountController.updateProfile));

module.exports = router;
