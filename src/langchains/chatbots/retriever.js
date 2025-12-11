import AppError from '../../utils/AppError.js';
import { Pool } from 'pg';
const pool = new Pool();
class ChatbotRetrieverService {
  async getLatestSensorPredictions() {
    try {
      const query = `
      WITH latest_per_machine AS (
        SELECT DISTINCT ON (m.id)
          m.id AS machine_id,
          m.name AS machine_name,
          mr.status,
          mr.rul_hours AS RUL,
          mr.priority,
          mr.action,
          fs.type AS failure_type,
          fs.confidence AS failure_confidence,
          fs.heat_dissipation_failure,
          fs.tool_wear_failure,
          fs.overstrain_failure,
          fs.random_failures,
          fs.power_failure
        FROM machines AS m
        JOIN sensor_data AS sd ON m.id = sd.machine_id
        JOIN maintenance_recommendations AS mr ON mr.sensor_data_id = sd.id
        LEFT JOIN failure_statistics AS fs ON fs.maintenance_recommendation_id = mr.id
        ORDER BY m.id, sd.date_time DESC
      )
      SELECT *
        FROM latest_per_machine
      WHERE status in ('WARNING', 'CRITICAL')
      LIMIT 5
      `;

      const result = await pool.query(query);
      return result.rows.map((row) => this._formatMachineContext(row));
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data last prediction  : ${error.message} `,
        500
      );
    }
  }

  async getMachineStatusById(id) {
    try {
      const query = `
      WITH latest_per_machine AS (
        SELECT DISTINCT ON (m.id)
          m.id AS machine_id,
          m.name AS machine_name,
          mr.status,
          mr.rul_hours AS RUL,
          mr.priority,
          mr.action,
          fs.type AS failure_type,
          fs.confidence AS failure_confidence,
          fs.heat_dissipation_failure,
          fs.tool_wear_failure,
          fs.overstrain_failure,
          fs.random_failures,
          fs.power_failure
        FROM machines AS m
        JOIN sensor_data AS sd ON m.id = sd.machine_id
        JOIN maintenance_recommendations AS mr ON mr.sensor_data_id = sd.id
        LEFT JOIN failure_statistics AS fs ON fs.maintenance_recommendation_id = mr.id
        ORDER BY m.id, sd.date_time DESC
      )
      SELECT *
        FROM latest_per_machine
      WHERE machine_id = $1
      LIMIT 1
      `;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return false;
      }
      return result.rows.map((row) => this._formatMachineContext(row));
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data last prediction by id  : ${error.message} `,
        500
      );
    }
  }

  async getMachineStatusByName(name) {
    try {
      const query = `
      WITH latest_per_machine AS (
        SELECT DISTINCT ON (m.id)
          m.id AS machine_id,
          m.name AS machine_name,
          mr.status,
          mr.rul_hours AS RUL,
          mr.priority,
          mr.action,
          fs.type AS failure_type,
          fs.confidence AS failure_confidence,
          fs.heat_dissipation_failure,
          fs.tool_wear_failure,
          fs.overstrain_failure,
          fs.random_failures,
          fs.power_failure
        FROM machines AS m
        JOIN sensor_data AS sd ON m.id = sd.machine_id
        JOIN maintenance_recommendations AS mr ON mr.sensor_data_id = sd.id
        LEFT JOIN failure_statistics AS fs ON fs.maintenance_recommendation_id = mr.id
        ORDER BY m.id, sd.date_time DESC
      )
      SELECT *
        FROM latest_per_machine
      WHERE machine_name ilike $1
      LIMIT 1
      `;

      const result = await pool.query(query, [name]);

      if (result.rows.length === 0) {
        return false;
      }

      return result.rows.map((row) => this._formatMachineContext(row));
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data last prediction by name  : ${error.message} `,
        500
      );
    }
  }

  async getMachineStatusByType(type) {
    try {
      const query = `
      WITH latest_per_machine AS (
        SELECT DISTINCT ON (m.id)
          m.id AS machine_id,
          m.name AS machine_name,
          mr.status,
          mr.rul_hours AS RUL,
          mr.priority,
          mr.action,
          fs.type AS failure_type,
          fs.confidence AS failure_confidence,
          fs.heat_dissipation_failure,
          fs.tool_wear_failure,
          fs.overstrain_failure,
          fs.random_failures,
          fs.power_failure
        FROM machines AS m
        JOIN sensor_data AS sd ON m.id = sd.machine_id
        JOIN maintenance_recommendations AS mr ON mr.sensor_data_id = sd.id
        LEFT JOIN failure_statistics AS fs ON fs.maintenance_recommendation_id = mr.id
        ORDER BY m.id, sd.date_time DESC
      )
      SELECT *
        FROM latest_per_machine
      WHERE failure_type ilike $1
      LIMIT 5
      `;

      const result = await pool.query(query, [type]);
      return result.rows.map((row) => this._formatMachineContext(row));
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data last prediction  : ${error.message} `,
        500
      );
    }
  }

  async getMachineStatusByStatus(status) {
    try {
      const query = `
      WITH latest_per_machine AS (
        SELECT DISTINCT ON (m.id)
          m.id AS machine_id,
          m.name AS machine_name,
          mr.status,
          mr.rul_hours AS RUL,
          mr.priority,
          mr.action,
          fs.type AS failure_type,
          fs.confidence AS failure_confidence,
          fs.heat_dissipation_failure,
          fs.tool_wear_failure,
          fs.overstrain_failure,
          fs.random_failures,
          fs.power_failure
        FROM machines AS m
        JOIN sensor_data AS sd ON m.id = sd.machine_id
        JOIN maintenance_recommendations AS mr ON mr.sensor_data_id = sd.id
        LEFT JOIN failure_statistics AS fs ON fs.maintenance_recommendation_id = mr.id
        ORDER BY m.id, sd.date_time DESC
      )
      SELECT *
        FROM latest_per_machine
      WHERE status ilike $1
      LIMIT 5
      `;

      const result = await pool.query(query, [status]);
      return result.rows.map((row) => this._formatMachineContext(row));
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data last prediction  : ${error.message} `,
        500
      );
    }
  }

  async getMachineStatusByPriority(priority) {
    try {
      const query = `
      WITH latest_per_machine AS (
        SELECT DISTINCT ON (m.id)
          m.id AS machine_id,
          m.name AS machine_name,
          mr.status,
          mr.rul_hours AS RUL,
          mr.priority,
          mr.action,
          fs.type AS failure_type,
          fs.confidence AS failure_confidence,
          fs.heat_dissipation_failure,
          fs.tool_wear_failure,
          fs.overstrain_failure,
          fs.random_failures,
          fs.power_failure
        FROM machines AS m
        JOIN sensor_data AS sd ON m.id = sd.machine_id
        JOIN maintenance_recommendations AS mr ON mr.sensor_data_id = sd.id
        LEFT JOIN failure_statistics AS fs ON fs.maintenance_recommendation_id = mr.id
        ORDER BY m.id, sd.date_time DESC
      )
      SELECT *
        FROM latest_per_machine
      WHERE priority ilike $1
      LIMIT 5
      `;

      const result = await pool.query(query, [priority]);
      return result.rows.map((row) => this._formatMachineContext(row));
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data last prediction  : ${error.message} `,
        500
      );
    }
  }

  async getMachineStatusBySmallestRUL(rul = 7) {
    try {
      const query = `
      WITH latest_per_machine AS (
        SELECT DISTINCT ON (m.id)
          m.id AS machine_id,
          m.name AS machine_name,
          mr.status,
          mr.rul_hours AS RUL,
          mr.priority,
          mr.action,
          fs.type AS failure_type,
          fs.confidence AS failure_confidence,
          fs.heat_dissipation_failure,
          fs.tool_wear_failure,
          fs.overstrain_failure,
          fs.random_failures,
          fs.power_failure
        FROM machines AS m
        JOIN sensor_data AS sd ON m.id = sd.machine_id
        JOIN maintenance_recommendations AS mr ON mr.sensor_data_id = sd.id
        LEFT JOIN failure_statistics AS fs ON fs.maintenance_recommendation_id = mr.id
        ORDER BY m.id, sd.date_time DESC
      )
      SELECT *
        FROM latest_per_machine
      WHERE RUL <= $1
      LIMIT 5
      `;

      const result = await pool.query(query, [rul]);
      return result.rows.map((row) => this._formatMachineContext(row));
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data last prediction  : ${error.message} `,
        500
      );
    }
  }

  async getMachineStatusByHighestRUL(rul = 60) {
    try {
      const query = `
      WITH latest_per_machine AS (
        SELECT DISTINCT ON (m.id)
          m.id AS machine_id,
          m.name AS machine_name,
          mr.status,
          mr.rul_hours AS RUL,
          mr.priority,
          mr.action,
          fs.type AS failure_type,
          fs.confidence AS failure_confidence,
          fs.heat_dissipation_failure,
          fs.tool_wear_failure,
          fs.overstrain_failure,
          fs.random_failures,
          fs.power_failure
        FROM machines AS m
        JOIN sensor_data AS sd ON m.id = sd.machine_id
        JOIN maintenance_recommendations AS mr ON mr.sensor_data_id = sd.id
        LEFT JOIN failure_statistics AS fs ON fs.maintenance_recommendation_id = mr.id
        ORDER BY m.id, sd.date_time DESC
      )
      SELECT *
        FROM latest_per_machine
      WHERE RUL >= $1
      LIMIT 5
      `;

      const result = await pool.query(query, [rul]);
      return result.rows.map((row) => this._formatMachineContext(row));
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data last prediction  : ${error.message} `,
        500
      );
    }
  }

  _formatMachineContext(row) {
    return `
    Mesin: ${row.machine_name} (ID: ${row.machine_id})
    Status: ${row.status}
    RUL: ${row.rul || row.RUL} jam
    Priority: ${row.priority}
    Action: ${row.action}

    Failure Statistics:
    - Type: ${row.failure_type || 'None'}
    - Confidence: ${row.failure_confidence || 0}
    - Heat dissipation failure: ${row.heat_dissipation_failure || 0}
    - Tool wear failure: ${row.tool_wear_failure || 0}
    - Overstrain failure: ${row.overstrain_failure || 0}
    - Random failures: ${row.random_failures || 0}
    - Power failure: ${row.power_failure || 0}
    `;
  }
}

export default new ChatbotRetrieverService();
