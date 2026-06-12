import express from 'express';
import { departmentController } from '../controllers/departmentController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { verifyToken, authorize } from '../middleware/authMiddleware.js';
import { departmentSchema } from '../utils/validators/departmentValidator.js';

const router = express.Router();

// All department routes require authentication
router.use(verifyToken);

// Get all departments - accessible by HR and Admin
router.get('/', departmentController.getAllDepartments);

// Get department by ID - accessible by HR and Admin
router.get('/:id', departmentController.getDepartmentById);

// Create department - only Admin
router.post(
  '/',
  authorize('admin', 'hr'),
  validateRequest(departmentSchema.create),
  departmentController.createDepartment
);

// Update department - only Admin
router.put(
  '/:id',
  authorize('admin', 'hr'),
  validateRequest(departmentSchema.update),
  departmentController.updateDepartment
);

// Delete department - only Admin
router.delete(
  '/:id',
  authorize('admin'),
  departmentController.deleteDepartment
);

export default router;