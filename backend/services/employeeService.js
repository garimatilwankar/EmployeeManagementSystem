import pool from '../config/database.js';
import AppError from '../utils/errorHandler.js';
import logger from '../config/logger.js';

export const employeeService = {
  async getAllEmployees(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          ep.phone,
          ep.designation,
          ep.salary,
          d.department_name,
          ep.hire_date
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        LEFT JOIN departments d ON ep.department_id = d.id
        WHERE u.role != 'admin'
      `;

      const params = [];
      let paramCount = 0;

      // Apply filters
      if (filters.department) {
        paramCount++;
        query += ` AND d.id = $${paramCount}`;
        params.push(filters.department);
      }

      if (filters.designation) {
        paramCount++;
        query += ` AND LOWER(ep.designation) LIKE LOWER($${paramCount})`;
        params.push(`%${filters.designation}%`);
      }

      if (filters.search) {
        paramCount++;
        query += ` AND (LOWER(u.name) LIKE LOWER($${paramCount}) OR LOWER(u.email) LIKE LOWER($${paramCount}))`;
        params.push(`%${filters.search}%`);
        params.push(`%${filters.search}%`);
        paramCount++;
      }

      query += ` ORDER BY u.name ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get count
      let countQuery = 'SELECT COUNT(*) FROM users u LEFT JOIN employee_profiles ep ON u.id = ep.user_id LEFT JOIN departments d ON ep.department_id = d.id WHERE u.role != \'admin\'';
      const countParams = [];
      let countParamCount = 0;

      if (filters.department) {
        countParamCount++;
        countQuery += ` AND d.id = $${countParamCount}`;
        countParams.push(filters.department);
      }

      if (filters.designation) {
        countParamCount++;
        countQuery += ` AND LOWER(ep.designation) LIKE LOWER($${countParamCount})`;
        countParams.push(`%${filters.designation}%`);
      }

      const countResult = await pool.query(countQuery, countParams);
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
      logger.error('Error fetching employees:', error);
      throw error;
    }
  },

  async getEmployeeById(id) {
    try {
      const result = await pool.query(
        `SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          ep.phone,
          ep.address,
          ep.designation,
          ep.salary,
          ep.hire_date,
          d.id as department_id,
          d.department_name,
          ep.manager_id
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        LEFT JOIN departments d ON ep.department_id = d.id
        WHERE u.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Employee not found', 404);
      }

      const employee = result.rows[0];

      // Get employee skills
      const skillsResult = await pool.query(
        `SELECT es.skill_id, s.skill_name, es.proficiency_level
         FROM employee_skills es
         JOIN skills s ON es.skill_id = s.id
         WHERE es.employee_id = $1`,
        [employee.id]
      );

      // Get employee images
      const imagesResult = await pool.query(
        'SELECT * FROM employee_images WHERE employee_id = $1',
        [employee.id]
      );

      return {
        ...employee,
        skills: skillsResult.rows,
        images: imagesResult.rows,
      };
    } catch (error) {
      if (error.statusCode === 404) throw error;
      logger.error('Error fetching employee:', error);
      throw error;
    }
  },

  async createEmployee(employeeData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        userId,
        departmentId,
        phone,
        address,
        designation,
        salary,
        hireDate,
        managerId,
      } = employeeData;

      // Check if employee profile already exists
      const existing = await client.query(
        'SELECT id FROM employee_profiles WHERE user_id = $1',
        [userId]
      );

      if (existing.rows.length > 0) {
        throw new AppError('Employee profile already exists for this user', 409);
      }

      const result = await client.query(
        `INSERT INTO employee_profiles 
         (user_id, department_id, phone, address, designation, salary, hire_date, manager_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, user_id, department_id, phone, address, designation, salary, hire_date`,
        [userId, departmentId, phone, address, designation, salary, hireDate, managerId || null]
      );

      const employee = result.rows[0];

      // Create initial leave balance for all leave types
      const leaveTypes = await client.query('SELECT id FROM leave_types');
      const currentYear = new Date().getFullYear();

      for (const leaveType of leaveTypes.rows) {
        await client.query(
          `INSERT INTO leave_balance (employee_id, leave_type_id, available_days, year)
           VALUES ($1, $2, $3, $4)`,
          [employee.id, leaveType.id, 0, currentYear]
        );
      }

      // Log the action
      await client.query(
        `INSERT INTO audit_logs (table_name, action_type, record_id, new_data, performed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        ['employee_profiles', 'insert', employee.id, JSON.stringify(employee), 1]
      );

      await client.query('COMMIT');

      logger.info(`Employee created: ${userId}`);

      return employee;
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.statusCode) throw error;
      logger.error('Error creating employee:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async updateEmployee(id, employeeData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if employee exists
      const existing = await client.query(
        'SELECT * FROM employee_profiles WHERE user_id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        throw new AppError('Employee not found', 404);
      }

      const oldData = existing.rows[0];
      const { departmentId, phone, address, designation, salary, managerId } = employeeData;

      const result = await client.query(
        `UPDATE employee_profiles
         SET department_id = $1, phone = $2, address = $3, designation = $4, 
             salary = $5, manager_id = $6, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $7
         RETURNING *`,
        [departmentId, phone, address, designation, salary, managerId || null, id]
      );

      const updatedEmployee = result.rows[0];

      // Log the action
      await client.query(
        `INSERT INTO audit_logs (table_name, action_type, record_id, old_data, new_data, performed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        ['employee_profiles', 'update', updatedEmployee.id, JSON.stringify(oldData), JSON.stringify(updatedEmployee), 1]
      );

      await client.query('COMMIT');

      logger.info(`Employee updated: ${id}`);

      return updatedEmployee;
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.statusCode) throw error;
      logger.error('Error updating employee:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteEmployee(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if employee exists
      const existing = await client.query(
        'SELECT * FROM employee_profiles WHERE user_id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        throw new AppError('Employee not found', 404);
      }

      const employee = existing.rows[0];

      // Deactivate user instead of deleting
      await client.query(
        'UPDATE users SET is_active = FALSE WHERE id = $1',
        [id]
      );

      // Log the action
      await client.query(
        `INSERT INTO audit_logs (table_name, action_type, record_id, old_data, performed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        ['employee_profiles', 'delete', employee.id, JSON.stringify(employee), 1]
      );

      await client.query('COMMIT');

      logger.info(`Employee deactivated: ${id}`);

      return { message: 'Employee deactivated successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.statusCode) throw error;
      logger.error('Error deleting employee:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async addEmployeeSkill(employeeId, skillId, proficiencyLevel) {
    try {
      // Check if skill is already assigned
      const existing = await pool.query(
        'SELECT id FROM employee_skills WHERE employee_id = $1 AND skill_id = $2',
        [employeeId, skillId]
      );

      if (existing.rows.length > 0) {
        throw new AppError('Skill already assigned to employee', 409);
      }

      const result = await pool.query(
        `INSERT INTO employee_skills (employee_id, skill_id, proficiency_level)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [employeeId, skillId, proficiencyLevel || 'intermediate']
      );

      logger.info(`Skill added to employee: ${employeeId}`);

      return result.rows[0];
    } catch (error) {
      if (error.statusCode) throw error;
      logger.error('Error adding employee skill:', error);
      throw error;
    }
  },

  async removeEmployeeSkill(employeeId, skillId) {
    try {
      const result = await pool.query(
        'DELETE FROM employee_skills WHERE employee_id = $1 AND skill_id = $2',
        [employeeId, skillId]
      );

      if (result.rowCount === 0) {
        throw new AppError('Skill not found for this employee', 404);
      }

      logger.info(`Skill removed from employee: ${employeeId}`);

      return { message: 'Skill removed successfully' };
    } catch (error) {
      if (error.statusCode) throw error;
      logger.error('Error removing employee skill:', error);
      throw error;
    }
  },
};