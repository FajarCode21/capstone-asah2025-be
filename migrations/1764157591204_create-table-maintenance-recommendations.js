export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('maintenance_recommendations', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    rul_hours: {
      type: 'float',
      notNull: true,
    },
    rul_days: {
      type: 'float',
      notNull: true,
    },
    status: {
      type: 'varchar(255)',
      notNull: true,
    },
    priority: {
      type: 'varchar(255)',
      notNull: true,
    },
    action: {
      type: 'varchar(255)',
      notNull: true,
    },
    sensor_data_id: {
      type: 'integer',
      notNull: true,
      references: 'sensor_data',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('maintenance_recommendations');
};
