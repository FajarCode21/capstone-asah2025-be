import DashboardService from '../services/DashboardService.js';
import AppError from '../utils/AppError.js';

class DashboardController {
  async getDashboardSummary(req, res, next) {
    try {
      const result = await DashboardService.getDashboardSummary();
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardTrend(req, res, next) {
    try {
      const { days = 5 } = req.query;
      const result = await DashboardService.getDashboardTrend(days);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req, res, next) {
    try {
      const result = await DashboardService.getDashboardStats();
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getFailureStatByID(req, res, next) {
    try {
      const { id } = req.params;
      const result = await DashboardService.getFailureStatByID(id);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getFailureStatByID(req, res, next) {
    try {
      const { id } = req.params;
      const result = await DashboardService.getFailureStatByID(id);
      if (!result.length) {
        throw new AppError('Data tidak ditemukan', 404);
      }
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
