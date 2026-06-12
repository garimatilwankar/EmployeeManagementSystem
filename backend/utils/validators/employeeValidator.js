import Joi from 'joi';

export const employeeSchema = {
  create: Joi.object({
    userId: Joi.number().required().messages({
      'number.base': 'User ID must be a number',
      'any.required': 'User ID is required',
    }),
    departmentId: Joi.number().required().messages({
      'number.base': 'Department ID must be a number',
      'any.required': 'Department ID is required',
    }),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        'string.empty': 'Phone is required',
        'string.pattern.base': 'Phone must be 10 digits',
      }),
    address: Joi.string().min(5).max(500).required().messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address must not exceed 500 characters',
    }),
    designation: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'Designation is required',
      'string.min': 'Designation must be at least 3 characters',
      'string.max': 'Designation must not exceed 100 characters',
    }),
    salary: Joi.number().min(0).required().messages({
      'number.base': 'Salary must be a number',
      'number.min': 'Salary must be greater than 0',
      'any.required': 'Salary is required',
    }),
    hireDate: Joi.date().required().messages({
      'date.base': 'Hire date must be a valid date',
      'any.required': 'Hire date is required',
    }),
    managerId: Joi.number().optional(),
  }),

  update: Joi.object({
    departmentId: Joi.number().required(),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),
    address: Joi.string().min(5).max(500).required(),
    designation: Joi.string().min(3).max(100).required(),
    salary: Joi.number().min(0).required(),
    managerId: Joi.number().optional(),
  }),

  addSkill: Joi.object({
    skillId: Joi.number().required().messages({
      'number.base': 'Skill ID must be a number',
      'any.required': 'Skill ID is required',
    }),
    proficiencyLevel: Joi.string()
      .valid('beginner', 'intermediate', 'advanced', 'expert')
      .optional()
      .default('intermediate'),
  }),
};