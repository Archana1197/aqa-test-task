import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TaskPage } from '../pages/TaskPage';
import { TaskAPI } from '../api/task.api';
import { AuthAPI } from '../api/auth.api';

export type TestFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  taskPage: TaskPage;
  taskAPI: TaskAPI;
  authAPI: AuthAPI;
};

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

  taskAPI: async ({ request }, use) => {
    const taskAPI = new TaskAPI(request);
    await use(taskAPI);
  },

  authAPI: async ({ request }, use) => {
    const authAPI = new AuthAPI(request);
    await use(authAPI);
  },
});

export { expect };
