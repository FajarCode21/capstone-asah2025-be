import Joi from 'joi';

const msg = {
  'string.base': '{#label} harus berupa teks',
  'any.only': '{#label} berisi nilai yang tidak valid',
};

export const maintenanceTicketSchema = Joi.object({
  status: Joi.string()
    .valid('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')
    .required()
    .messages(msg),
});
