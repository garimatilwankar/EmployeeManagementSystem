import pool from '../config/database.js';
import AppError from '../utils/errorHandler.js';
import logger from '../config/logger.js';

export const skillService = {
  async getAllSkills(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const result = await pool.query(
        'SELECT * FROM skills ORDER BY skill_name ASC LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      const countResult = await pool.query('SELECT COUNT(*) FROM skills');
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
      logger.error('Error fetching skills:', error);
      throw error;
    }
  },

  async getSkillById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM skills WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Skill not found', 404);
      }

      return result.rows[0];
    } catch (error) {
      if (error.statusCode === 404) throw error;
      logger.error('Error fetching skill:', error);
      throw error;
    }
  },

  async createSkill(skillName, description) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if skill already exists
      const existing = await client.query(
        'SELECT id FROM skills WHERE LOWER(skill_name) = LOWER($1)',
        [skillName]
      );

      if (existing.rows.length > 0) {
        throw new AppError('Skill already exists', 409);
      }

      const result = await client.query(
        `INSERT INTO skills (skill_name, description)
         VALUES ($1, $2)
         RETURNING *`,
        [skillName, description || null]
      );

      const skill = result.rows[0];

      // Log the action
      await client.query(
        `INSERT INTO audit_logs (table_name, action_type, record_id, new_data, performed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        ['skills', 'insert', skill.id, JSON.stringify(skill), 1]
      );

      await client.query('COMMIT');

      logger.info(`Skill created: ${skillName}`);

      return skill;
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.statusCode) throw error;
      logger.error('Error creating skill:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async updateSkill(id, skillName, description) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if skill exists
      const existing = await client.query(
        'SELECT * FROM skills WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        throw new AppError('Skill not found', 404);
      }

      const oldData = existing.rows[0];

      // Check for duplicate name
      if (skillName !== oldData.skill_name) {
        const duplicate = await client.query(
          'SELECT id FROM skills WHERE LOWER(skill_name) = LOWER($1) AND id != $2',
          [skillName, id]
        );

        if (duplicate.rows.length > 0) {
          throw new AppError('Skill name already exists', 409);
        }
      }

      const result = await client.query(
        `UPDATE skills
         SET skill_name = $1, description = $2
         WHERE id = $3
         RETURNING *`,
        [skillName, description || null, id]
      );

      const updatedSkill = result.rows[0];

      // Log the action
      await client.query(
        `INSERT INTO audit_logs (table_name, action_type, record_id, old_data, new_data, performed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        ['skills', 'update', id, JSON.stringify(oldData), JSON.stringify(updatedSkill), 1]
      );

      await client.query('COMMIT');

      logger.info(`Skill updated: ${skillName}`);

      return updatedSkill;
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.statusCode) throw error;
      logger.error('Error updating skill:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteSkill(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if skill exists
      const existing = await client.query(
        'SELECT * FROM skills WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        throw new AppError('Skill not found', 404);
      }

      const skill = existing.rows[0];

      // Check if skill is assigned to any employee
      const hasAssignments = await client.query(
        'SELECT COUNT(*) FROM employee_skills WHERE skill_id = $1',
        [id]
      );

      if (parseInt(hasAssignments.rows[0].count) > 0) {
        throw new AppError('Cannot delete skill with assigned employees', 400);
      }

      // Delete skill
      await client.query('DELETE FROM skills WHERE id = $1', [id]);

      // Log the action
      await client.query(
        `INSERT INTO audit_logs (table_name, action_type, record_id, old_data, performed_by, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        ['skills', 'delete', id, JSON.stringify(skill), 1]
      );

      await client.query('COMMIT');

      logger.info(`Skill deleted: ${skill.skill_name}`);

      return { message: 'Skill deleted successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.statusCode) throw error;
      logger.error('Error deleting skill:', error);
      throw error;
    } finally {
      client.release();
    }
  },
};