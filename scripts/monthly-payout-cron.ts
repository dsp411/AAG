/**
 * Automated Monthly Background Payout Cron Worker
 *
 * Runs automatically on the server at 00:00 UTC on the 1st day of every month (`0 0 1 * *`).
 * Executes the net profit payout process across all registered user accounts
 * even when users are completely offline.
 *
 * To run locally or in a server container:
 *   npx tsx scripts/monthly-payout-cron.ts
 */

import cron from 'node-cron';
import { executeMonthlyPayoutsForAllUsers } from '../lib/payout-service';

console.log('[AAG Payout Scheduler] Initializing monthly background payout worker...');

// Schedule for midnight (00:00) on the 1st day of every month
// Cron expression format: (minute hour day-of-month month day-of-week)
const MONTHLY_CRON_SCHEDULE = '0 0 1 * *';

cron.schedule(
  MONTHLY_CRON_SCHEDULE,
  async () => {
    const timestamp = new Date().toISOString();
    console.log(`[AAG Payout Scheduler] [${timestamp}] Starting monthly automated background payouts...`);

    try {
      const summary = await executeMonthlyPayoutsForAllUsers();
      console.log(
        `[AAG Payout Scheduler] Finished monthly payouts: Processed ${summary.totalProcessed} users | Succeeded: ${summary.succeeded} | Skipped: ${summary.skipped} | Failed: ${summary.failed}`
      );
    } catch (error) {
      console.error('[AAG Payout Scheduler] Fatal error executing monthly payouts:', error);
    }
  },
  {
    timezone: 'UTC',
  }
);

console.log(`[AAG Payout Scheduler] Background cron schedule established: "${MONTHLY_CRON_SCHEDULE}" (00:00 UTC on 1st of every month).`);

// If run with '--now' argument, execute immediately once for validation
if (process.argv.includes('--now')) {
  console.log('[AAG Payout Scheduler] Running one-time immediate payout test...');
  executeMonthlyPayoutsForAllUsers()
    .then(summary => {
      console.log('[AAG Payout Scheduler] Test run complete:', summary);
      process.exit(0);
    })
    .catch(err => {
      console.error('[AAG Payout Scheduler] Test run error:', err);
      process.exit(1);
    });
}
