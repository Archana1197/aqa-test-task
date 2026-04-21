import { cleanupE2eUsers } from './data/testDataCleaner';
import { envBoolean } from './config/env';

async function globalTeardown(): Promise<void> {
  if (!envBoolean('ENABLE_TEST_DATA_CLEANUP', true)) {
    return;
  }

  try {
    await cleanupE2eUsers();
  } catch (error) {
    // Cleanup should not fail the run in environments without DB access.
    console.warn(`[global-teardown] Test data cleanup skipped: ${String(error)}`);
  }
}

export default globalTeardown;
