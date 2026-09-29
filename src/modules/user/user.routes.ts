import { Router } from 'express';
import * as UserController from './user.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected routes
router.get('/:id', authenticate, UserController.getProfile);
router.patch('/:id', authenticate, UserController.updateProfile);

// Admin only
router.get('/', authenticate, authorize('ADMIN'), UserController.getAllUsers);
router.patch('/:id/role', authenticate, authorize('ADMIN'), UserController.updateUserRole); // New route
router.delete('/:id', authenticate, authorize('ADMIN'), UserController.deleteUser);


export default router;