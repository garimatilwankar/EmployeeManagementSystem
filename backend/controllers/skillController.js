import { skillService } from '../services/skillService.js';
import logger from '../config/logger.js';

export const skillController = {
  async getAllSkills(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await skillService.getAllSkills(page, limit);

      res.status(200).json({
        success: true,
        message: 'Skills retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSkillById(req, res, next) {
    try {
      const { id } = req.params;

      const skill = await skillService.getSkillById(id);

      res.status(200).json({
        success: true,
        message: 'Skill retrieved successfully',
        data: skill,
      });
    } catch (error) {
      next(error);
    }
  },

  async createSkill(req, res, next) {
    try {
      const { skillName, description } = req.body;

      const skill = await skillService.createSkill(skillName, description);

      logger.info(`Skill created by user ${req.user.id}: ${skillName}`);

      res.status(201).json({
        success: true,
        message: 'Skill created successfully',
        data: skill,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSkill(req, res, next) {
    try {
      const { id } = req.params;
      const { skillName, description } = req.body;

      const skill = await skillService.updateSkill(id, skillName, description);

      logger.info(`Skill updated by user ${req.user.id}: ${skillName}`);

      res.status(200).json({
        success: true,
        message: 'Skill updated successfully',
        data: skill,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteSkill(req, res, next) {
    try {
      const { id } = req.params;

      const result = await skillService.deleteSkill(id);

      logger.info(`Skill deleted by user ${req.user.id}: ID ${id}`);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};