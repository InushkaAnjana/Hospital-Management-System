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
router.put('/users/:id', authenticate, authorize('Administrator'), authController.updateUser);
router.put('/users/:id/toggle-status', authenticate, authorize('Administrator'), authController.toggleUserStatus);
router.put('/users/:id/reset-password', authenticate, authorize('Administrator'), authController.resetPassword);
router.delete('/users/:id', authenticate, authorize('Administrator'), authController.deleteUser);

module.exports = router;
