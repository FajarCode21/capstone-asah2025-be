export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('chat_sessions', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_query: {
      type: 'text',
      notNull: true,
    },
    agent_response: {
      type: 'text',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });
};
export const down = (pgm) => {
  pgm.dropTable('chat_sessions');
};
