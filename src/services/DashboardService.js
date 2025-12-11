import AppError from '../utils/AppError.js';
import { Pool } from 'pg';
const pool = new Pool();
class DashboardService {
  async getDashboardSummary() {
    try {
      const query = `
      SELECT DISTINCT on (sd.machine_id) mr.status
      FROM sensor_data sd
      JOIN maintenance_recommendations mr ON sd.id = mr.sensor_data_id
      ORDER BY sd.machine_id, sd.date_time desc
      `;
      const result = await pool.query(query);
      const totalMachines = result.rows.length;
      const machineNormal = result.rows.filter(
        (machine) => machine.status === 'NORMAL'
      );
      const machineWarning = result.rows.filter(
        (machine) => machine.status === 'WARNING'
      );
      const machineCritical = result.rows.filter(
        (machine) => machine.status === 'CRITICAL'
      );

      return [
        {
          title: 'Total Aset',
          value: totalMachines,
          rate: 100,
        },
        {
          title: 'Normal',
          value: machineNormal.length,
          rate: (machineNormal.length / totalMachines) * 100 || 0,
        },
        {
          title: 'Warning',
          value: machineWarning.length,
          rate: (machineWarning.length / totalMachines) * 100 || 0,
        },
        {
          title: 'Critical',
          value: machineCritical.length,
          rate: (machineCritical.length / totalMachines) * 100 || 0,
        },
      ];
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data dashboard summary : ${error.message}`,
        500
      );
    }
  }

  async getDashboardTrend(days = 5) {
    try {
      const query = `
      WITH latest_per_machine_per_day AS (
        SELECT DISTINCT ON (sd.machine_id, date_trunc('day', sd.date_time)) 
          sd.machine_id,
          date_trunc('day', sd.date_time) AS day,
          mr.status
        FROM sensor_data sd
        JOIN maintenance_recommendations mr
          ON mr.sensor_data_id = sd.id
        WHERE sd.date_time >= current_date - ($1 - 1) * interval '1 day'
        ORDER BY sd.machine_id, date_trunc('day', sd.date_time) DESC, mr.created_at DESC
      )
      SELECT 
        day,
        COUNT(*) FILTER (WHERE status = 'NORMAL') AS normal_count,
        COUNT(*) FILTER (WHERE status = 'WARNING') AS warning_count,
        COUNT(*) FILTER (WHERE status = 'CRITICAL') AS critical_count
      FROM latest_per_machine_per_day
      GROUP BY day
      ORDER BY day DESC;
    `;

      const result = await pool.query(query, [days]);

      const data = result.rows.map((item) => {
        const timeZone = new Date(item.day);

        const year = timeZone.getFullYear();
        const month = String(timeZone.getMonth() + 1).padStart(2, '0');
        const day = String(timeZone.getDate()).padStart(2, '0');

        return {
          date: `${year}-${month}-${day}T00:00:00+07:00`,
          machineNormal: Number(item.normal_count) || 0,
          machineWarning: Number(item.warning_count) || 0,
          machineCritical: Number(item.critical_count) || 0,
        };
      });

      return data;
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data dashboard trend: ${error.message}`,
        500
      );
    }
  }

  async getDashboardStats() {
    try {
      const query = `
      SELECT DISTINCT ON (m.id) 
        m.id, 
        m.name, 
        mr.status, 
        sd.rotational_speed, 
        sd.process_temperature, 
        sd.air_temperature, 
        mr.rul_hours,
        mr.id AS rec_id
      FROM machines AS m
      JOIN sensor_data AS sd ON m.id = sd.machine_id
      JOIN maintenance_recommendations AS mr ON mr.sensor_data_id = sd.id
      ORDER BY m.id, sd.date_time DESC;
    `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data dashboard stats: ${error.message}`,
        500
      );
    }
  }

  async getFailureStatByID(id) {
    try {
      const query = `
      SELECT failure_statistics.* FROM failure_statistics
      JOIN maintenance_recommendations 
        ON failure_statistics.maintenance_recommendation_id = maintenance_recommendations.id
      WHERE maintenance_recommendations.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows;
    } catch (error) {
      throw new AppError(
        `Terjadi kesalahan dalam mengambil data Failure stats: ${error.message}`,
        500
      );
    }
  }
}

export default new DashboardService();
