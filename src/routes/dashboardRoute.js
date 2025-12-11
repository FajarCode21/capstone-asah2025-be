import express from 'express';
const Router = express.Router();

import DashboardController from '../controllers/DashboardController.js';

Router.get('/summary', DashboardController.getDashboardSummary);

Router.get('/trend', DashboardController.getDashboardTrend);

Router.get('/stats', DashboardController.getDashboardStats);

Router.get(
  '/failure-stats/:id/recommendation',
  DashboardController.getFailureStatByID
);

export default Router;
