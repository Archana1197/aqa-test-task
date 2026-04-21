import { defineConfig, devices } from '@playwright/test';
import { RuntimeConfig } from './config/runtime';
import { envBoolean } from './config/env';

/**
 * Playwright configuration for Vikunja QA tests
 */
export default defineConfig({
  testDir: './tests',
  globalTeardown: './global-teardown.ts',
  fullyParallel: RuntimeConfig.features.enableParallelExecution
    ? RuntimeConfig.environment.playwright.fullyParallel
    : false,
  forbidOnly: envBoolean('CI', false),
  retries: envBoolean('CI', false)
    ? Math.max(1, RuntimeConfig.environment.playwright.retries)
    : RuntimeConfig.environment.playwright.retries,
  workers: RuntimeConfig.features.enableParallelExecution
    ? RuntimeConfig.environment.playwright.workers
    : 1,
  reporter: [
    ['list'],
    ['html'],
    ['./reporters/enterpriseReporter.ts'],
  ],
  timeout: RuntimeConfig.environment.playwright.timeoutMs,
  use: {
    baseURL: RuntimeConfig.environment.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: RuntimeConfig.environment.playwright.actionTimeoutMs,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
