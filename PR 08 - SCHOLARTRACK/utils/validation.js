const { body, validationResult } = require('express-validator');

const handleValidation = (view, mapData) => (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(422).render(view, {
    title: mapData.title,
    errors: errors.array(),
    formData: req.body,
    ...(mapData.extra ? mapData.extra(req) : {})
  });
};

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters.'),
  body('username')
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9_]{3,30}$/)
    .withMessage('Username must be 3-30 characters and use only letters, numbers or underscores.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must contain at least 8 characters.'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match.');
    }
    return true;
  })
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

const submissionRules = [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters.'),
  body('subject').trim().isLength({ min: 2, max: 80 }).withMessage('Subject must be between 2 and 80 characters.'),
  body('type').isIn(['Assignment', 'Practical', 'Presentation', 'Mini Project', 'Report']).withMessage('Select a valid type.'),
  body('status').isIn(['Planned', 'In Progress', 'Submitted', 'Reviewed']).withMessage('Select a valid status.'),
  body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Select a valid priority.'),
  body('dueDate').isISO8601().toDate().withMessage('Choose a valid due date.'),
  body('marks')
    .optional({ values: 'falsy' })
    .isInt({ min: 0, max: 100 })
    .withMessage('Marks must be between 0 and 100.'),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 800 }).withMessage('Notes cannot exceed 800 characters.')
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  submissionRules
};
