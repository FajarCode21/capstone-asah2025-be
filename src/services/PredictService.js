import { PythonShell } from 'python-shell';
import { Pool } from 'pg';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import AppError from '../utils/AppError.js';

class PredictService {
  constructor() {
    this._pyPath = path.resolve(__dirname, '../models/script/main.py');
    this._pool = new Pool();
  }
  async createPredicts(payload) {
    try {
      const result = await this._predict(payload);

      const recommendationFormatted = [].concat(
        await this._formattedMaintenanceRecommendationData(result, payload)
      );
      const recommendations = await this._createMaintenanceRecommendations(
        recommendationFormatted
      );

      const failureStatisticFormatted = [].concat(
        await this._formattedFailureStatisticData(result, recommendations)
      );
      if (failureStatisticFormatted.length) {
        const failure_id = await this._createFailureStatistics(
          failureStatisticFormatted
        );

        await this._createMaintenanceTickets(failure_id);
      }
    } catch (error) {
      throw new AppError(error.message, error.statusCode);
    }
  }

  async createSensorData(data) {
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN;');
      const result = [];
      for (const item of data) {
        const res = await client.query(
          `
        INSERT INTO sensor_data (
            date_time, type, rotational_speed, process_temperature, air_temperature, torque,
            tool_wear, machine_age_hours, hours_since_last, temp_rate_of_change, rpm_variance, machine_id
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning *
        `,
          [
            item.datetime,
            item.Type,
            item.Rotational_speed,
            item.Process_temperature,
            item.Air_temperature,
            item.Torque,
            item.Tool_wear,
            item.machine_age_hours,
            item.hours_since_last,
            item.Temp_Rate_of_Change,
            item.RPM_Variance,
            item.machineID,
          ]
        );
        const inserted = res.rows[0];
        result.push({
          id: inserted.id,
          datetime: inserted.date_time,
          Type: inserted.type,
          Rotational_speed: inserted.rotational_speed,
          Process_temperature: inserted.process_temperature,
          Air_temperature: inserted.air_temperature,
          Torque: inserted.torque,
          Tool_wear: inserted.tool_wear,
          machine_age_hours: inserted.machine_age_hours,
          hours_since_last: inserted.hours_since_last,
          Temp_Rate_of_Change: inserted.temp_rate_of_change,
          RPM_Variance: inserted.rpm_variance,
          machineID: inserted.machine_id,
        });
      }
      await client.query('COMMIT;');
      console.log('Sensor Data inserted successfully');
      return result;
    } catch (error) {
      await client.query('ROLLBACK;');
      throw new AppError(
        `Terdapat kesalahan dalam memproses data sensor : ${error.message}`,
        400
      );
    } finally {
      client.release();
    }
  }

  async _createMaintenanceRecommendations(payload) {
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN;');
      const result = [];
      for (const data of payload) {
        const res = await client.query(
          `
          INSERT INTO maintenance_recommendations (
            rul_hours, rul_days, status, priority, action, sensor_data_id
          ) VALUES ($1,$2,$3,$4,$5,$6) returning *
        `,
          [
            data.rul_hours,
            data.rul_days,
            data.status,
            data.priority,
            data.action,
            data.sensor_data_id,
          ]
        );
        result.push(res.rows[0]);
      }
      await client.query('COMMIT;');
      console.log('Maintenance Recommendations inserted successfully');
      return result;
    } catch (error) {
      await client.query('ROLLBACK;');
      throw new AppError(
        `Terdapat kesalahan dalam memproses data maintenance recommendation : ${error.message}`,
        400
      );
    } finally {
      client.release();
    }
  }

  async _createFailureStatistics(payload) {
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN;');
      const result = [];
      for (const data of payload) {
        const res = await client.query(
          `
          INSERT INTO failure_statistics (
            type, confidence, heat_dissipation_failure, random_failures, overstrain_failure, power_failure, tool_wear_failure, maintenance_recommendation_id
          ) VALUES ($1,$2,$3,$4,$5,$6,$7, $8) returning id
        `,
          [
            data.type,
            data.confidence,
            data.heat_dissipation_failure,
            data.random_failures,
            data.overstrain_failure,
            data.power_failure,
            data.tool_wear_failure,
            data.maintenance_recommendation_id,
          ]
        );
        result.push(res.rows[0]);
      }
      await client.query('COMMIT;');
      console.log('Failure Statistics inserted successfully');
      return result;
    } catch (error) {
      await client.query('ROLLBACK;');
      throw new AppError(
        `Terdapat kesalahan dalam memproses data failure statistics : ${error.message}`,
        400
      );
    } finally {
      client.release();
    }
  }
  async _createMaintenanceTickets(payload) {
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN;');
      for (const data of payload) {
        await client.query(
          `
          INSERT INTO maintenance_tickets (failure_statistics_id)
          VALUES ($1)`,
          [data.id]
        );
      }
      await client.query('COMMIT;');
      console.log('Maintenance Tickets inserted successfully');
    } catch (error) {
      await client.query('ROLLBACK;');
      throw new AppError(
        `Terdapat kesalahan dalam memproses data maintenance ticket : ${error.message}`,
        400
      );
    } finally {
      client.release();
    }
  }

  async _formattedMaintenanceRecommendationData(result, payload) {
    const formatted = result.map((data, index) => ({
      sensor_data_id: payload[index].id,
      ...data.prediction,
    }));

    return formatted;
  }

  async _formattedFailureStatisticData(result, payload) {
    const formatted = result
      .map((data, index) => ({
        ...data.failure,
        maintenance_recommendation_id: payload[index].id,
      }))
      .filter((data) => data.type != null)
      .map((data) => ({
        ...data,
        type: data.type,
        confidence: data.confidence,
        heat_dissipation_failure:
          data.probabilities['Heat Dissipation Failure'],
        random_failures: data.probabilities['Random Failures'],
        overstrain_failure: data.probabilities['Overstrain Failure'],
        power_failure: data.probabilities['Power Failure'],
        tool_wear_failure: data.probabilities['Tool Wear Failure'],
      }));

    return formatted;
  }
  async _predict(payload) {
    return new Promise((resolve, reject) => {
      try {
        let pyshell = new PythonShell(this._pyPath, {
          mode: 'json',
          pythonOptions: ['-u'],
        });

        pyshell.send(payload);

        pyshell.on('message', (message) => {
          resolve(message);
        });

        pyshell.end((err) => {
          if (err) {
            reject(
              new AppError(
                `Terdapat kesalahan pada python shell : ${err.message}`,
                500
              )
            );
          }
        });
      } catch (error) {
        reject(
          new AppError(`Terdapat kesalahan pada model : ${error.message}`, 500)
        );
      }
    });
  }
}

export default new PredictService();
