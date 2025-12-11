// src/seeds/machineSeed.js
import seedMachine from './seedMachine.js';
import MaintenanceTicketSeedService from './seedMaintenanceTickets.js';

(async () => {
  try {
    await seedMachine.seed();
    // await MaintenanceTicketSeedService.seed();
  } catch (error) {
    console.error('Failed to seed machines:', error);
  }
})();
