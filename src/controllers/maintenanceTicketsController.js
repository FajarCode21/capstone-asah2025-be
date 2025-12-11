import MaintenanceTicketsService from '../services/MaintenanceTicketsService.js';
import { maintenanceTicketValidator } from '../validators/maintenanceTicket/index.js';

import AppError from '../utils/AppError.js';

class MaintenanceTicketsController {
  async getAllMaintenanceTickets(req, res, next) {
    try {
      const { status = '' } = req.query;
      const tickets = await MaintenanceTicketsService.getAllMaintenanceTickets(
        status
      );

      res.status(200).json({
        status: 'success',
        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMaintenanceTicketById(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await MaintenanceTicketsService.getMaintenanceTicketById(
        id
      );

      if (!ticket) {
        return next(
          new AppError('Ticket dengan Id tersebut tidak ditemukan', 404)
        );
      }

      res.status(200).json({
        status: 'success',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMaintenanceTicket(req, res, next) {
    try {
      const { id } = req.params;
      const ticketData = maintenanceTicketValidator.validateMaintenanceTicket(
        req.body
      );

      const updatedTicket =
        await MaintenanceTicketsService.updateMaintenanceTicket(id, ticketData);

      if (!updatedTicket) {
        return next(
          new AppError('Ticket dengan Id tersebut tidak ditemukan', 404)
        );
      }

      res.status(200).json({
        status: 'success',
        message: 'Maintenance ticket berhasil diupdate',
        data: updatedTicket,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMaintenanceTicket(req, res, next) {
    try {
      const { id } = req.params;
      const deletedTicket =
        await MaintenanceTicketsService.deleteMaintenanceTicket(id);

      if (!deletedTicket) {
        return next(
          new AppError('Ticket dengan Id tersebut tidak ditemukan', 404)
        );
      }

      res.status(200).json({
        status: 'success',
        message: 'Maintenance ticket berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MaintenanceTicketsController();
