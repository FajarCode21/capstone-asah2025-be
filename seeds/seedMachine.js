// src/services/MachineService.js
import { Pool } from 'pg';
import 'dotenv/config';

class SeedService {
  constructor() {
    this._pool = new Pool();
  }

  async seed() {
    const query1 = `
       INSERT INTO machines (name, location)
        SELECT 
            name_base || ' ' || num AS name,
            'Location ' || ((num % 10) + 1) AS location
        FROM (
            SELECT gs AS num,
                CASE ((gs - 1) % 10) + 1
                    WHEN 1 THEN 'Generator'
                    WHEN 2 THEN 'Pump'
                    WHEN 3 THEN 'Compressor'
                    WHEN 4 THEN 'Fan'
                    WHEN 5 THEN 'Boiler'
                    WHEN 6 THEN 'Motor'
                    WHEN 7 THEN 'Turbine'
                    WHEN 8 THEN 'Valve'
                    WHEN 9 THEN 'Conveyor'
                    WHEN 10 THEN 'Heater'
                END AS name_base
            FROM generate_series(1, 400) AS gs
        ) AS sub;`;

    try {
      await this._pool.query(query1);
      console.log('Seeding completed.');
    } catch (error) {
      console.error('Seeding error:', error);
      throw error;
    } finally {
      await this._pool.end();
      console.log('Database connection closed.');
    }
  }
}

export default new SeedService();
