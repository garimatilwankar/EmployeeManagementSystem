import pool from '../config/database.js';
import AppError from '../utils/errorHandler.js';
import logger from '../config/logger.js';

export const departmentService = {
  async getAllDepartments(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const result = await pool.query(
        'SELECT * FROM departments ORDER BY department_name ASC LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      const countResult = await pool.query('SELECT COUNT(*) FROM departments');
      const total = parseInt(countResult.rows[0].count);

      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching departments:', error);
      throw error;
    }
  },

  async getDepartmentById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM departments WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Department not found', 404);
      }

      return result.rows[0];
    } catch (error) {
      if (error.statusCode === 404) throw error;
      logger.error('Error fetching department:', error);
      throw error;
    }
  },

  async createDepartment(departmentName, description) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if department already exists
      const existingDept = await client.query(
        'SELECT id FROM departments WHERE LOWER(department_name) = LOWER($1)',
        [departmentName]
      );

      if (existingDept.rows.length > 0) {
        throw new AppError('Department already exists', 409);
      }

      const result = await client.query(
        `INSERT INTO departments (department_name, description)
         VALUES ($1, $2)
         RETURNING *`,
        [departmentName, description || null]
      );

      const department = result.rows[0];

      // Log the action
      await client.query(
        `INSERT INTO audit_logs (table_name, action_type, record_id, new_data, performed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        ['departments', 'insert', department.id, JSON.stringify(department), 1]
      );

      await client.query('COMMIT');

      logger.info(`Department created: ${departmentName}`);

      return department;
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.statusCode) throw error;
      logger.error('Error creating department:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async updateDepartment(id, departmentName, description) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if department exists
      const existing = await client.query(
        'SELECT * FROM departments WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        throw new AppError('Department not found', 404);
      }

      const oldData = existing.rows[0];

      // Check for duplicate name
      if (departmentName !== oldData.department_name) {
        const duplicate = await client.query(
          'SELECT id FROM departments WHERE LOWER(department_name) = LOWER($1) AND id != $2',
          [departmentName, id]
        );

        if (duplicate.rows.length > 0) {
          throw new AppError('Department name already exists', 409);
        }
      }

      const result = await client.query(
        `UPDATE departments
         SET department_name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [departmentName, description || null, id]
      );

      const updatedDept = result.rows[0];

      // Log the action
      await client.query(
        `INSERT INTO audit_logs (table_name, action_type, record_id, old_data, new_data, performed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        ['departments', 'update', id, JSON.stringify(oldData), JSON.stringify(updatedDept), 1]
      );

      await client.query('COMMIT');

      logger.info(`Department updated: ${departmentName}`);

      return updatedDept;
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.statusCode) throw error;
      logger.error('Error updating department:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteDepartment(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if department exists
      const existing = await client.query(
        'SELECT * FROM departments WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        throw new AppError('Department not found', 404);
      }

      const department = existing.rows[0];

      // Check if department has employees
      const hasEmployees = await client.query(
        'SELECT COUNT(*) FROM employee_profiles WHERE department_id = $1',
        [id]
      );

      if (parseInt(hasEmployees.rows[0].count) > 0) {
        throw new AppError('Cannot delete department with active employees', 400);
      }

      // Delete department
      await client.query('DELETE FROM departments WHERE id = $1', [id]);

      // Log the action
      await client.query(
        `INSERT INTO audit_logs (table_name, action_type, record_id, old_data, performed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        ['departments', 'delete', id, JSON.stringify(department), 1]
      );

      await client.query('COMMIT');

      logger.info(`Department deleted: ${department.department_name}`);

      return { message: 'Department deleted successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.statusCode) throw error;
      logger.error('Error deleting department:', error);
      throw error;
    } finally {
      client.release();
    }
  },
};