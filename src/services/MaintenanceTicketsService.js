import { Pool } from 'pg';
import AppError from '../utils/AppError.js';

const pool = new Pool();

class MaintenanceTicketsService {
  async getAllMaintenanceTickets(status) {
    try {
      const query = `
        SELECT
          m.id, m.name,
          mr.status, mr.priority,
          mt.id AS ticket_id, mt.status AS ticket_status, mt.created_at AS ticket_created_at
        FROM machines m
        JOIN sensor_data sd ON m.id = sd.machine_id
        JOIN maintenance_recommendations mr ON sd.id = mr.sensor_data_id
        JOIN failure_statistics fs ON mr.id = fs.maintenance_recommendation_id
        JOIN maintenance_tickets mt ON fs.id = mt.failure_statistics_id
        WHERE ($1 = '' OR mt.status = $1::ticket_status_enum)
        ORDER BY mt.created_at DESC
      `;

      const result = await pool.query(query, [status]);
      return result.rows;
    } catch (error) {
      throw new AppError(
        `Terdapat kesalahan dalam mengambil data ticket: ${error.message}`
      );
    }
  }

  async getMaintenanceTicketById(id) {
    try {
      const query = `
        SELECT
          m.id, m.name,
          mr.status, mr.priority, mr.action,
          fs.type, fs.confidence, fs.heat_dissipation_failure, fs.random_failures, fs.overstrain_failure, fs.power_failure, fs.tool_wear_failure,
          mt.id AS ticket_id, mt.status AS ticket_status, mt.created_at AS ticket_created_at
        FROM machines m
        JOIN sensor_data sd ON m.id = sd.machine_id
        JOIN maintenance_recommendations mr ON sd.id = mr.sensor_data_id
        JOIN failure_statistics fs ON mr.id = fs.maintenance_recommendation_id
        JOIN maintenance_tickets mt ON fs.id = mt.id
        WHERE mt.id = $1
        ORDER BY m.id, sd.date_time DESC
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new AppError(
        `Terdapat kesalahan dalam fetching data ticket: ${error.message}`
      );
    }
  }

  async updateMaintenanceTicket(id, ticketData) {
    try {
      const { status } = ticketData;

      const query = `
        UPDATE maintenance_tickets 
        SET 
          status = $1,
          UPDATED_AT = NOW()
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [status, id]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new AppError(`${error.message}`, 400);
    }
  }

  async deleteMaintenanceTicket(id) {
    try {
      const query =
        'DELETE FROM maintenance_tickets WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new AppError(`Tidak dapat menghapus ticket: ${error.message}`, 400);
    }
  }
}

export default new MaintenanceTicketsService();
