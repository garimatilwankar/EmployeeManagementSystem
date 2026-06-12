import express from 'express';
import { skillController } from '../controllers/skillController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { verifyToken, authorize } from '../middleware/authMiddleware.js';
import { skillSchema } from '../utils/validators/skillValidator.js';

const router = express.Router();

// All skill routes require authentication
router.use(verifyToken);

// Get all skills - accessible by all
router.get('/', skillController.getAllSkills);

// Get skill by ID - accessible by all
router.get('/:id', skillController.getSkillById);

// Create skill - only Admin and HR
router.post(
  '/',
  authorize('admin', 'hr'),
  validateRequest(skillSchema.create),
  skillController.createSkill
);

// Update skill - only Admin and HR
router.put(
  '/:id',
  authorize('admin', 'hr'),
  validateRequest(skillSchema.update),
  skillController.updateSkill
);

// Delete skill - only Admin
router.delete(
  '/:id',
  authorize('admin'),
  skillController.deleteSkill
);

export default router;