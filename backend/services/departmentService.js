import pool from '../config/database.js';

export const departmentService = {
  async getAllDepartments(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const departmentsQuery = `
      SELECT
        d.*,
        COUNT(ep.id) AS employee_count
      FROM departments d
      LEFT JOIN employee_profiles ep
        ON d.id = ep.department_id
      GROUP BY d.id
      ORDER BY d.department_name ASC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM departments
    `;

    const [departmentsResult, countResult] = await Promise.all([
      pool.query(departmentsQuery, [limit, offset]),
      pool.query(countQuery),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);

    return {
      data: departmentsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getDepartmentById(id) {
    const query = `
      SELECT
        d.*,
        COUNT(ep.id) AS employee_count
      FROM departments d
      LEFT JOIN employee_profiles ep
        ON d.id = ep.department_id
      WHERE d.id = $1
      GROUP BY d.id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error('Department not found');
    }

    return result.rows[0];
  },

  async createDepartment(departmentName, description) {
    const duplicateCheck = await pool.query(
      `SELECT id FROM departments WHERE department_name = $1`,
      [departmentName]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new Error('Department already exists');
    }

    const query = `
      INSERT INTO departments
      (department_name, description)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await pool.query(query, [
      departmentName,
      description,
    ]);

    return result.rows[0];
  },

  async updateDepartment(id, departmentName, description) {
    const query = `
      UPDATE departments
      SET
        department_name = $1,
        description = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [
      departmentName,
      description,
      id,
    ]);

    if (result.rows.length === 0) {
      throw new Error('Department not found');
    }

    return result.rows[0];
  },

  async deleteDepartment(id) {
    const employeeCheck = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM employee_profiles
      WHERE department_id = $1
      `,
      [id]
    );

    if (parseInt(employeeCheck.rows[0].total, 10) > 0) {
      throw new Error(
        'Cannot delete department with assigned employees'
      );
    }

    const result = await pool.query(
      `
      DELETE FROM departments
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Department not found');
    }

    return {
      message: 'Department deleted successfully',
    };
  },
};
