export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('machines', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    location: {
      type: 'varchar(255)',
      notNull: true,
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('machines');
};
