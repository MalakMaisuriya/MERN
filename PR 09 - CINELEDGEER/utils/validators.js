const { body } = require('express-validator');

exports.loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

exports.movieValidation = [
  body('title').trim().notEmpty().withMessage('Movie title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('releaseYear').isInt({ min: 1900, max: 2100 }).withMessage('Release year must be between 1900 and 2100'),
  body('language').isMongoId().withMessage('Valid language is required'),
  body('rentalRate').isFloat({ min: 0 }).withMessage('Rental rate must be a non-negative number'),
  body('replacementCost').isFloat({ min: 0 }).withMessage('Replacement cost must be a non-negative number'),
  body('rentalDuration').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Rental duration must be at least 1 day'),
  body('rating').optional().isIn(['G', 'PG', 'PG-13', 'R', 'NC-17']).withMessage('Invalid rating selection')
];

exports.actorValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required')
];

exports.categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required')
];

exports.customerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('address').isMongoId().withMessage('Valid address is required'),
  body('store').isMongoId().withMessage('Valid store is required')
];

exports.rentalValidation = [
  body('customer').isMongoId().withMessage('Valid customer is required'),
  body('inventory').isMongoId().withMessage('Valid inventory item is required'),
  body('paymentMethod').isIn(['Cash', 'Card', 'UPI']).withMessage('Valid payment method is required')
];

exports.paymentValidation = [
  body('customer').isMongoId().withMessage('Valid customer is required'),
  body('rental').isMongoId().withMessage('Valid rental reference is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod').isIn(['Cash', 'Card', 'UPI']).withMessage('Valid payment method is required')
];

exports.storeValidation = [
  body('name').trim().notEmpty().withMessage('Store name is required'),
  body('address').isMongoId().withMessage('Valid address is required')
];

exports.staffValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Admin', 'Staff']).withMessage('Invalid role selected')
];
