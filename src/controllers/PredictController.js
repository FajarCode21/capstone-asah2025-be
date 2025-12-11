import PredictService from '../services/PredictService.js';
import { predictValidator } from '../validators/predict/index.js';
class PredictController {
  constructor() {}
  async createPredict(req, res, next) {
    try {
      const input = Array.isArray(req.body) ? req.body : [req.body];
      predictValidator.validateCreatePredict(input);
      const sensorData = await PredictService.createSensorData(input);
      await PredictService.createPredicts(sensorData);

      res.status(200).json({
        status: 'success',
        message: 'Prediksi berhasil',
      });
    } catch (error) {
      next(error);
    }
  }
}
export default new PredictController();
