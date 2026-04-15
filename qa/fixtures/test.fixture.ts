import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TaskPage } from '../pages/TaskPage';
import { TaskAPI } from '../api/task.api';
import { AuthAPI } from '../api/auth.api';
import { RuntimeConfig } from '../config/runtime';
import { TestData, UserCredentials } from '../utils/testData';
import { TestOrchestrator } from '../orchestration/testOrchestrator';

let sharedFallbackUser: UserCredentials | null = null;
let sharedFallbackUserPromise: Promise<UserCredentials> | null = null;
const sharedAuthTokenByEmail = new Map<string, string>();

async function getOrCreateFallbackUser(authAPI: AuthAPI): Promise<UserCredentials> {
  if (sharedFallbackUser) {
    return sharedFallbackUser;
  }

  if (sharedFallbackUserPromise) {
    return sharedFallbackUserPromise;
  }

  const createPromise = (async () => {
    const fallbackUser = TestData.createUniqueUser();
    await authAPI.register(fallbackUser.username, fallbackUser.email, fallbackUser.password);
    sharedFallbackUser = fallbackUser;
    return fallbackUser;
  })();

  sharedFallbackUserPromise = createPromise;

  try {
    return await createPromise;
  } finally {
    sharedFallbackUserPromise = null;
  }
}

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
  /** Enterprise test orchestrator */
  orchestrator: TestOrchestrator;
  /** Per-test isolated user */
  testUser: UserCredentials;
  /** Per-test auth token */
  authToken: string;
  /** Page that is already logged in for the current isolated user */
  authenticatedPage: Page;
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
    const taskAPI = new TaskAPI(request, baseURL ?? RuntimeConfig.environment.baseUrl);
    await use(taskAPI);
  },

  authAPI: async ({ request, baseURL }, use) => {
    const authAPI = new AuthAPI(request, baseURL ?? RuntimeConfig.environment.baseUrl);
    await use(authAPI);
  },

  orchestrator: async ({ request, baseURL }, use) => {
    const orchestrator = new TestOrchestrator();
    const resolvedBaseUrl = baseURL ?? RuntimeConfig.environment.baseUrl;

    if (RuntimeConfig.features.enableDiagnostics) {
      await orchestrator.runHealthCheck(request, resolvedBaseUrl);
    }

    await use(orchestrator);
  },

  testUser: async ({ orchestrator, authAPI }, use) => {
    const generated = TestData.createUniqueUser();

    if (RuntimeConfig.features.enableDatabaseSeeding) {
      try {
        const seededUser = await orchestrator.createIsolatedUser(generated);
        try {
          await use(seededUser);
        } finally {
          await orchestrator.releaseUser(seededUser);
        }
        return;
      } catch (error) {
        console.warn(
          `[fixture] Database seeding unavailable, falling back to API registration: ${String(error)}`
        );
      }
    }

    const fallbackUser = await getOrCreateFallbackUser(authAPI);
    await use(fallbackUser);
  },

  authToken: async ({ authAPI, testUser }, use) => {
    const cachedToken = sharedAuthTokenByEmail.get(testUser.email);
    const token = cachedToken ?? await authAPI.login(testUser.email, testUser.password);
    if (!cachedToken) {
      sharedAuthTokenByEmail.set(testUser.email, token);
    }
    await use(token);
  },

  authenticatedPage: async ({ page, loginPage, testUser }, use) => {
    await loginPage.navigate();
    await loginPage.login(testUser.email, testUser.password);
    await use(page);
  },
});

export { expect };
