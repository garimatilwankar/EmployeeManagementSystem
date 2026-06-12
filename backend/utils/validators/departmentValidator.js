import Joi from 'joi';

export const departmentSchema = {
  create: Joi.object({
    departmentName: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'Department name is required',
      'string.min': 'Department name must be at least 3 characters',
      'string.max': 'Department name must not exceed 100 characters',
    }),
    description: Joi.string().max(500).optional().messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
  }),

  update: Joi.object({
    departmentName: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'Department name is required',
      'string.min': 'Department name must be at least 3 characters',
      'string.max': 'Department name must not exceed 100 characters',
    }),
    description: Joi.string().max(500).optional().messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
  }),
};