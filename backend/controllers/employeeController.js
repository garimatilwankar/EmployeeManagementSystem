import { employeeService } from '../services/employeeService.js';
import logger from '../config/logger.js';

export const employeeController = {
  async getAllEmployees(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        department: req.query.department,
        designation: req.query.designation,
        search: req.query.search,
      };

      const result = await employeeService.getAllEmployees(page, limit, filters);

      res.status(200).json({
        success: true,
        message: 'Employees retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getEmployeeById(req, res, next) {
    try {
      const { id } = req.params;

      const employee = await employeeService.getEmployeeById(id);

      res.status(200).json({
        success: true,
        message: 'Employee retrieved successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  },

  async createEmployee(req, res, next) {
    try {
      const employeeData = req.body;

      const employee = await employeeService.createEmployee(employeeData);

      logger.info(`Employee created by user ${req.user.id}: ${employeeData.userId}`);

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const employeeData = req.body;

      const employee = await employeeService.updateEmployee(id, employeeData);

      logger.info(`Employee updated by user ${req.user.id}: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteEmployee(req, res, next) {
    try {
      const { id } = req.params;

      const result = await employeeService.deleteEmployee(id);

      logger.info(`Employee deleted by user ${req.user.id}: ${id}`);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  async addEmployeeSkill(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { skillId, proficiencyLevel } = req.body;

      const skill = await employeeService.addEmployeeSkill(
        employeeId,
        skillId,
        proficiencyLevel
      );

      logger.info(`Skill added to employee ${employeeId} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Skill added successfully',
        data: skill,
      });
    } catch (error) {
      next(error);
    }
  },

  async removeEmployeeSkill(req, res, next) {
    try {
      const { employeeId, skillId } = req.params;

      const result = await employeeService.removeEmployeeSkill(employeeId, skillId);

      logger.info(`Skill removed from employee ${employeeId} by user ${req.user.id}`);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};