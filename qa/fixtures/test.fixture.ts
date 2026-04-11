import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TaskPage } from '../pages/TaskPage';
import { TaskAPI } from '../api/task.api';
import { AuthAPI } from '../api/auth.api';
import { TestConstants } from '../config/page.config';

/**
 * Custom test fixtures
 * Extends Playwright's base test with custom page objects and API helpers
 */
export type TestFixtures = {
  /** Login page object */
  loginPage: LoginPage;
  /** Registration page object */
  registerPage: RegisterPage;
  /** Task management page object */
  taskPage: TaskPage;
  /** Task API helper */
  taskAPI: TaskAPI;
  /** Authentication API helper */
  authAPI: AuthAPI;
};

/**
 * Extended test with custom fixtures
 * Provides automatic setup and teardown for page objects and API helpers
 */
export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },

  taskPage: async ({ page }, use) => {
    const taskPage = new TaskPage(page);
    await use(taskPage);
  },

  taskAPI: async ({ request, baseURL }, use) => {
    // baseURL is Playwright's built-in fixture — reads from playwright.config.ts use.baseURL
    // which honours the BASE_URL environment variable, giving a single source of truth.
    const taskAPI = new TaskAPI(request, baseURL ?? TestConstants.BASE_URL);
    await use(taskAPI);
  },

  authAPI: async ({ request, baseURL }, use) => {
    const authAPI = new AuthAPI(request, baseURL ?? TestConstants.BASE_URL);
    await use(authAPI);
  },
});

export { expect };
