import Joi from 'joi';

export const createPredictSchema = Joi.array().items({
  datetime: Joi.date().required(),
  Type: Joi.string().valid('L', 'M', 'H').required(),
  Rotational_speed: Joi.number().required(),
  Process_temperature: Joi.number().required(),
  Air_temperature: Joi.number().required(),
  Torque: Joi.number().required(),
  Tool_wear: Joi.number().required(),
  machine_age_hours: Joi.number().required(),
  hours_since_last: Joi.number().required(),
  Temp_Rate_of_Change: Joi.number().required(),
  RPM_Variance: Joi.number().required(),
  machineID: Joi.number().required(),
});
