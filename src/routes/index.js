import express from 'express';
const Route = express.Router();

import PredictRoute from './predictRoute.js';
import MaintenanceTicketsRoute from './maintenanceTicketsRoute.js';
import DashboardRoute from './dashboardRoute.js';
import ChatbotRoute from './chatbotRoute.js';

Route.use('/api/chatbot', ChatbotRoute);
Route.use('/api/predict', PredictRoute);
Route.use('/api/dashboard', DashboardRoute);
Route.use('/api/maintenance-tickets', MaintenanceTicketsRoute);

export default Route;
