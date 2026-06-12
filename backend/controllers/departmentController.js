import { departmentService } from '../services/departmentService.js';
import logger from '../config/logger.js';

export const departmentController = {
  async getAllDepartments(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await departmentService.getAllDepartments(page, limit);

      res.status(200).json({
        success: true,
        message: 'Departments retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getDepartmentById(req, res, next) {
    try {
      const { id } = req.params;

      const department = await departmentService.getDepartmentById(id);

      res.status(200).json({
        success: true,
        message: 'Department retrieved successfully',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  },

  async createDepartment(req, res, next) {
    try {
      const { departmentName, description } = req.body;

      const department = await departmentService.createDepartment(
        departmentName,
        description
      );

      logger.info(`Department created by user ${req.user.id}: ${departmentName}`);

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const { departmentName, description } = req.body;

      const department = await departmentService.updateDepartment(
        id,
        departmentName,
        description
      );

      logger.info(`Department updated by user ${req.user.id}: ${departmentName}`);

      res.status(200).json({
        success: true,
        message: 'Department updated successfully',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteDepartment(req, res, next) {
    try {
      const { id } = req.params;

      const result = await departmentService.deleteDepartment(id);

      logger.info(`Department deleted by user ${req.user.id}: ID ${id}`);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};