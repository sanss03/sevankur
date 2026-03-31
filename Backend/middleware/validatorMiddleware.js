const { body, validationResult } = require('express-validator');

// Helper to check validation results and return errors if they exist
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for Registration (Signup)
const signupValidationRules = [
  body('username').notEmpty().withMessage('Username is required').trim(),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

// Validation rules for Login
const loginValidationRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Validation rules for Chat requests
const chatValidationRules = [
  body('message').notEmpty().withMessage('Message text cannot be empty').trim(),
  validate
];

module.exports = {
  signupValidationRules,
  loginValidationRules,
  chatValidationRules
};
