export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('failure_statistics', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    type: {
      type: 'varchar(255)',
      notNull: true,
    },
    confidence: {
      type: 'float',
      notNull: true,
    },
    heat_dissipation_failure: {
      type: 'float',
      notNull: true,
    },
    random_failures: {
      type: 'float',
      notNull: true,
    },
    overstrain_failure: {
      type: 'float',
      notNull: true,
    },
    power_failure: {
      type: 'float',
      notNull: true,
    },
    tool_wear_failure: {
      type: 'float',
      notNull: true,
    },
    maintenance_recommendation_id: {
      type: 'integer',
      notNull: true,
      references: 'maintenance_recommendations',
      onDelete: 'CASCADE',
    },
    create_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('failure_statistics');
};
