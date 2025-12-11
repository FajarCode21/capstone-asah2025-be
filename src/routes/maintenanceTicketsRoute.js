import express from 'express';
import MaintenanceTicketsController from '../controllers/maintenanceTicketsController.js';

const Router = express.Router();

Router.route('/').get(MaintenanceTicketsController.getAllMaintenanceTickets);

Router.route('/:id')
  .get(MaintenanceTicketsController.getMaintenanceTicketById)
  .put(MaintenanceTicketsController.updateMaintenanceTicket)
  .delete(MaintenanceTicketsController.deleteMaintenanceTicket);

export default Router;
