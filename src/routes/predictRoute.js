import express from 'express';
const Router = express.Router();

import PredictController from '../controllers/PredictController.js';

Router.post('/', PredictController.createPredict);

export default Router;
