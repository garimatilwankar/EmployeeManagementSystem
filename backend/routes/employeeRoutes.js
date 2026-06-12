import express from 'express';
import { employeeController } from '../controllers/employeeController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { verifyToken, authorize } from '../middleware/authMiddleware.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';
import { employeeSchema } from '../utils/validators/employeeValidator.js';

const router = express.Router();

// All employee routes require authentication
router.use(verifyToken);

// Get all employees - accessible by HR and Admin
router.get('/', authorize('admin', 'hr', 'manager'), employeeController.getAllEmployees);

// Get employee by ID - accessible by employee (own profile) or HR/Admin
router.get('/:id', employeeController.getEmployeeById);

// Create employee - only Admin and HR
router.post(
  '/',
  authorize('admin', 'hr'),
  validateRequest(employeeSchema.create),
  employeeController.createEmployee
);

// Update employee - only Admin and HR
router.put(
  '/:id',
  authorize('admin', 'hr'),
  validateRequest(employeeSchema.update),
  employeeController.updateEmployee
);

// Delete employee - only Admin
router.delete(
  '/:id',
  authorize('admin'),
  employeeController.deleteEmployee
);

// Add skill to employee
router.post(
  '/:employeeId/skills',
  authorize('admin', 'hr'),
  validateRequest(employeeSchema.addSkill),
  employeeController.addEmployeeSkill
);

// Remove skill from employee
router.delete(
  '/:employeeId/skills/:skillId',
  authorize('admin', 'hr'),
  employeeController.removeEmployeeSkill
);

export default router;