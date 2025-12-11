export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createType('machine_type_enum', ['L', 'M', 'H']);
  pgm.createTable('sensor_data', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    date_time: {
      type: 'timestamp',
      notNull: true,
    },
    type: {
      type: 'machine_type_enum',
      notNull: true,
    },
    rotational_speed: {
      type: 'float',
      notNull: true,
    },
    process_temperature: {
      type: 'float',
      notNull: true,
    },
    air_temperature: {
      type: 'float',
      notNull: true,
    },
    torque: {
      type: 'float',
      notNull: true,
    },
    tool_wear: {
      type: 'float',
      notNull: true,
    },
    machine_age_hours: {
      type: 'float',
      notNull: true,
    },
    hours_since_last: {
      type: 'float',
      notNull: true,
    },
    temp_rate_of_change: {
      type: 'float',
      notNull: true,
    },
    rpm_variance: {
      type: 'float',
      notNull: true,
    },
    machine_id: {
      type: 'integer',
      notNull: true,
      references: '"machines"',
      onDelete: 'cascade',
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('sensor_data');
  pgm.dropType('machine_type_enum');
};
