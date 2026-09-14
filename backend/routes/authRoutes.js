const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Authenticated user routes
router.get('/me', authenticate, authController.getMe);

// Administrator user management routes
router.get('/users', authenticate, authorize('Administrator'), authController.getUsers);
router.post('/register', authenticate, authorize('Administrator'), authController.registerUser);

module.exports = router;
