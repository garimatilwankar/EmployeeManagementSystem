import Joi from 'joi';

export const skillSchema = {
  create: Joi.object({
    skillName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Skill name is required',
        'any.required': 'Skill name is required',
      }),

    description: Joi.string()
      .trim()
      .allow('')
      .max(500)
      .optional(),
  }),

  update: Joi.object({
    skillName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    description: Joi.string()
      .trim()
      .allow('')
      .max(500)
      .optional(),
  }),
};