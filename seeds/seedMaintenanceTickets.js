// src/services/MaintenanceTicketSeedService.js
import { Pool } from 'pg';
import 'dotenv/config';

class MaintenanceTicketSeedService {
  constructor() {
    this._pool = new Pool();
  }

  async seed() {
    const query = `
      INSERT INTO maintenance_tickets (
        name_pic, 
        contact, 
        member, 
        date, 
        estimated_duration, 
        maintenance_type, 
        status,
        part, 
        additional_notes, 
        image, 
        machine_id
      )
      SELECT 
        -- name_pic: Random PIC names
        (ARRAY[
          'Budi Santoso', 'Siti Rahayu', 'Ahmad Wijaya', 'Maya Sari', 'Rizki Pratama', 
          'Diana Putri', 'Hendra Kurniawan', 'Fitri Anggraini', 'Joko Susilo', 'Linda Wati',
          'Agus Setiawan', 'Rina Marlina', 'Fajar Nugroho', 'Desi Anggraini', 'Eko Prasetyo',
          'Sari Indah', 'Rudi Hermawan', 'Mega Puspita', 'Ari Wibowo', 'Nina Septiani'
        ])[(gs % 20) + 1] as name_pic,
        
        -- contact: Random phone numbers
        '08' || lpad((floor(random() * 999999999)::int)::text, 10, '0') as contact,
        
        -- member: Random team members as JSON array (1-4 members)
        (
          SELECT jsonb_agg(
            (ARRAY[
              'Andi', 'Sari', 'Rudi', 'Dewi', 'Fajar', 'Rina', 'Hendra', 'Lina', 'Joko', 
              'Kevin', 'Putri', 'Dian', 'Feri', 'Ani', 'Eko', 'Mila', 'Bambang', 'Ari', 
              'Dina', 'Maya', 'Santi', 'Tono', 'Rizky', 'Nina', 'Agus', 'Budi', 'Citra',
              'Denny', 'Eka', 'Farhan', 'Gita', 'Hadi', 'Indra', 'Juli', 'Kiki', 'Lia'
            ])[floor(random() * 36)::int + 1]
          )
          FROM generate_series(1, (floor(random() * 4)::int + 1))
        ) as member,
        
        -- date: Random dates within the last 60 days
        NOW() - (random() * INTERVAL '60 days') as date,
        
        -- estimated_duration: Random durations
        (ARRAY[
          '1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours', 
          '3.5 hours', '4 hours', '5 hours', '6 hours', '8 hours'
        ])[(floor(random() * 10)::int) + 1] as estimated_duration,
        
        -- maintenance_type: Using the enum values
        (ARRAY['preventive', 'corrective', 'predictive', 'inspective'])[
          CASE 
            WHEN random() < 0.4 THEN 1  -- preventive (40%)
            WHEN random() < 0.7 THEN 2  -- corrective (30%)
            WHEN random() < 0.9 THEN 3  -- predictive (20%)
            ELSE 4                       -- inspective (10%)
          END
        ]::maintenance_type_enum as maintenance_type,
        
        -- status: Using the enum values with realistic distribution
        (ARRAY['open', 'in_progress', 'closed'])[
          CASE 
            WHEN random() < 0.3 THEN 1  -- open (30%)
            WHEN random() < 0.7 THEN 2  -- in_progress (40%)
            ELSE 3                       -- closed (30%)
          END
        ]::status_enum as status,
        
        -- part: Random machine parts
        (ARRAY[
          'Engine Assembly', 'Hydraulic System', 'Electrical Panel', 'Conveyor Belt', 
          'Control System', 'Cooling System', 'Pneumatic System', 'Bearing Assembly',
          'Safety Guards', 'Lubrication System', 'Sensor Array', 'Motor Drive',
          'Gearbox', 'Compressor Unit', 'Fan Blades', 'Valve System', 'PLC Controller',
          'Wiring Harness', 'Pressure Vessel', 'Heat Exchanger'
        ])[(floor(random() * 20)::int) + 1] as part,
        
        -- additional_notes: Random notes or NULL
        CASE 
          WHEN random() < 0.8 THEN 
            (ARRAY[
              'Regular scheduled maintenance according to maintenance plan',
              'Urgent repair needed due to unexpected breakdown',
              'Follow up from previous maintenance work order',
              'Customer reported unusual noise during operation',
              'Routine inspection and performance verification',
              'Performance optimization and calibration',
              'Safety compliance check and certification',
              'Component replacement due to wear and tear',
              'System calibration for improved accuracy',
              'Preventive measures applied to avoid future issues',
              'Emergency repair after system failure',
              'Vibration analysis and alignment check',
              'Thermal imaging inspection completed',
              'Lubrication service and oil analysis',
              'Electrical safety testing and verification',
              'Software update and system reboot',
              'Cleaning and preventive maintenance',
              'Alignment and balancing procedure',
              'Pressure testing and leak detection',
              'Performance test after repair completion'
            ])[(floor(random() * 20)::int) + 1]
          ELSE NULL 
        END as additional_notes,
        
        -- image: Random image names or NULL
        CASE 
          WHEN random() < 0.6 THEN 
            'maintenance_' || lpad((floor(random() * 1000)::int)::text, 3, '0') || '.jpg'
          ELSE NULL 
        END as image,
        
        -- machine_id: Random machine ID between 1 and 400
        floor(random() * 400)::int + 1 as machine_id
        
      FROM generate_series(1, 200) as gs;
    `;

    try {
      // Clear existing data
      await this._pool.query('DELETE FROM maintenance_tickets');

      // Insert new data
      const result = await this._pool.query(query);
      console.log(
        `Seeding completed: ${result.rowCount} maintenance tickets added.`
      );

      // Show some statistics
      const stats = await this._pool.query(`
        SELECT 
          maintenance_type,
          status,
          COUNT(*) as count
        FROM maintenance_tickets 
        GROUP BY maintenance_type, status 
        ORDER BY maintenance_type, status;
      `);

      console.log('\nMaintenance Tickets Distribution:');
      stats.rows.forEach((row) => {
        console.log(
          `  ${row.maintenance_type} - ${row.status}: ${row.count} tickets`
        );
      });
    } catch (error) {
      console.error('Seeding error:', error);
      throw error;
    } finally {
      await this._pool.end();
      console.log('Database connection closed.');
    }
  }
}

export default new MaintenanceTicketSeedService();
