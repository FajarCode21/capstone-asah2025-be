export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createType('ticket_status_enum', [
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
  ]);
  pgm.createTable('maintenance_tickets', {
    id: {
      type: 'SERIAL',
      primaryKey: true,
    },
    failure_statistics_id: {
      type: 'INTEGER',
      notNull: true,
      references: '"failure_statistics"',
      onDelete: 'CASCADE',
    },
    status: {
      type: 'ticket_status_enum',
      notNull: true,
      default: 'OPEN',
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('maintenance_tickets');
  pgm.dropType('ticket_status_enum');
};
