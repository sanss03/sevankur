const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { signupValidationRules, loginValidationRules } = require('../middleware/validatorMiddleware');

router.post('/register', signupValidationRules, register);
router.post('/signup',   signupValidationRules, register);   // alias
router.post('/login',    loginValidationRules,  login);

router.get('/', (req, res) => res.json({ message: 'Auth endpoint ready' }));

module.exports = router;
