import { createPredictSchema } from './schema.js';
import AppError from '../../utils/AppError.js';

export const predictValidator = {
  validateCreatePredict: (payload) => {
    const { error } = createPredictSchema.validate(payload);
    if (error) throw new AppError(error.message, 400);
  },
};
