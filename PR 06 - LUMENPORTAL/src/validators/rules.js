const { body, param, query } = require('express-validator');

const signInRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const signUpRules = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must include an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must include a number'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

const topicRules = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Title must be between 2 and 60 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('accentColor')
    .optional({ checkFalsy: true })
    .matches(/^#([A-Fa-f0-9]{6})$/)
    .withMessage('Accent color must be a valid hex code')
];

const publicationRules = [
  body('headline')
    .trim()
    .isLength({ min: 5, max: 120 })
    .withMessage('Headline must be between 5 and 120 characters'),
  body('summary')
    .trim()
    .isLength({ min: 10, max: 300 })
    .withMessage('Summary must be between 10 and 300 characters'),
  body('body')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Body must contain at least 20 characters'),
  body('topic')
    .notEmpty()
    .withMessage('Select a topic'),
  body('status')
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid publication status'),
  body('readingMinutes')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 60 })
    .withMessage('Reading time must be between 1 and 60 minutes')
];

const mongoIdParam = (name) => [
  param(name)
    .isMongoId()
    .withMessage('Invalid identifier supplied')
];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
  query('sort').optional().isString()
];

module.exports = {
  signInRules,
  signUpRules,
  topicRules,
  publicationRules,
  mongoIdParam,
  listQueryRules
};
