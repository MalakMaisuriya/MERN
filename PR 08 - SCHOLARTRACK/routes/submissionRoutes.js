const express = require('express');
const { ensureAuthenticated } = require('../middleware/auth');
const submissionController = require('../controllers/submissionController');
const { handleValidation, submissionRules } = require('../utils/validation');

const router = express.Router();

const formExtra = () => submissionController.getFormOptions();

router.use(ensureAuthenticated);

router.get('/', submissionController.listSubmissions);
router.get('/new', submissionController.showNewForm);
router.post(
  '/',
  submissionRules,
  handleValidation('submissions/new', {
    title: 'New Submission',
    extra: formExtra
  }),
  submissionController.createSubmission
);
router.get('/:id', submissionController.showSubmission);
router.get('/:id/edit', submissionController.showEditForm);
router.put(
  '/:id',
  submissionRules,
  handleValidation('submissions/edit', {
    title: 'Edit Submission',
    extra: (req) => ({
      ...formExtra(),
      submission: { _id: req.params.id, ...req.body }
    })
  }),
  submissionController.updateSubmission
);
router.delete('/:id', submissionController.deleteSubmission);

module.exports = router;
