import path from 'path';
import fs from 'fs';
import { test, expect } from '../fixtures/test.fixture';
import { TestData } from '../utils/testData';
import { getErrorMessage } from '../utils/errorHandler';
import { TestConstants, AuthSelectors } from '../config/page.config';

/**
 * Additional Task Management Tests
 *
 * NOTE: Priority CRUD tests (TC001-TC006) are in priority.spec.ts
 * This file contains supplementary task management tests covering UI, API, and combined flows.
 * Test IDs: TC015-TC020
 */

test.describe('Task Management - UI Read Tests', () => {
  let testUser: { username: string; email: string; password: string };
  // Deterministic path via __dirname — identical in Playwright's collection and worker processes.
  const authFile = path.join(__dirname, '..', '.auth', 'tasks-ui.json');

  test.beforeAll(async ({ browser, authAPI }) => {
    test.setTimeout(300000); // Allow 5 min for registration retries under rate-limiting
    testUser = TestData.createUniqueUser();
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    console.log(`\n[SETUP] Creating test user: ${testUser.email}`);

    await authAPI.register(testUser.username, testUser.email, testUser.password);

    // Single UI login — save auth state for all tests in this describe
    const ctx = await browser.newContext({ baseURL: process.env.BASE_URL ?? TestConstants.BASE_URL });
    const pg = await ctx.newPage();
    await pg.goto('/login');
    await pg.getByLabel(AuthSelectors.LOGIN_EMAIL_LABEL).fill(testUser.email);
    await pg.getByLabel(AuthSelectors.LOGIN_PASSWORD_LABEL, { exact: true }).fill(testUser.password);
    await pg.getByRole('button', { name: AuthSelectors.LOGIN_BUTTON_LABEL }).click();
    await pg.waitForURL('/');
    await ctx.storageState({ path: authFile });
    await ctx.close();
    console.log(`[SETUP] Auth state saved`);
  });

  test.use({ storageState: authFile });

  test('TC015: Should display correct task count', async ({ taskPage }) => {
    console.log(`\n[TC015] Starting task count verification test`);

    try {
      await taskPage.navigate();
      const initialCount = await taskPage.getTaskCount();
      console.log(`[TC015] Initial count: ${initialCount}`);

      const task1 = TestData.createTask('Count Test 1');
      const task2 = TestData.createTask('Count Test 2');

      await taskPage.addTask(task1.title);
      await taskPage.addTask(task2.title);
      console.log(`[TC015] Created 2 tasks`);

      const finalCount = await taskPage.getTaskCount();
      console.log(`[TC015] Final count: ${finalCount}`);

      expect(finalCount).toBe(initialCount + 2);
      console.log(`[TC015] PASSED - Task count is accurate`);
    } catch (error) {
      console.error(`[TC015] FAILED - Task count verification failed`);
      console.error(`[TC015] Error: ${getErrorMessage(error)}`);
      throw error;
    }
  });
});

test.describe('Task Management - API Only Tests', () => {
  test.describe.configure({ timeout: 180000 });

  let testUser: { username: string; email: string; password: string };
  let authToken: string;
  let inboxProjectId: number;

  // API-only tests need no browser session, just register and login via API once.
  test.beforeAll(async ({ authAPI, taskAPI }) => {
    test.setTimeout(300000); // 5 min — allow full exponential backoff if app rate-limits
    testUser = TestData.createUniqueUser();
    console.log(`\n[SETUP] Creating test user via API: ${testUser.email}`);

    await authAPI.register(testUser.username, testUser.email, testUser.password);
    authToken = await authAPI.login(testUser.email, testUser.password);
    console.log(`[SETUP] Auth token obtained: ${authToken.substring(0, 20)}...`);

    // Resolve the user's inbox project ID dynamically — not always 1 in a shared instance
    const projects = await taskAPI.getProjects(authToken);
    const inbox = projects.find(p => String(p.title).toLowerCase() === 'inbox') ?? projects[0];
    inboxProjectId = inbox.id;
    console.log(`[SETUP] Inbox project ID: ${inboxProjectId}`);
  });

  test('TC016: Should create task via API', async ({ taskAPI }) => {
    const taskData = TestData.createTask('API Create Task');
    console.log(`\n[TC016] Starting API task creation test`);
    console.log(`[TC016] Task title: "${taskData.title}"`);

    try {
      const createdTask = await taskAPI.createTask(authToken, {
        title: taskData.title,
        project_id: inboxProjectId
      });

      console.log(`[TC016] API Response: ${JSON.stringify(createdTask)}`);
      expect(createdTask.title).toBe(taskData.title);
      expect(createdTask.id).toBeDefined();
      console.log(`[TC016] PASSED - Task created via API with ID: ${createdTask.id}`);
    } catch (error) {
      console.error(`[TC016] FAILED - API task creation failed`);
      console.error(`[TC016] Error: ${getErrorMessage(error)}`);
      console.error(`[TC016] Task title: "${taskData.title}"`);
      throw error;
    }
  });

  test('TC017: Should read task via API', async ({ taskAPI }) => {
    const taskData = TestData.createTask('API Read Task');
    console.log(`\n[TC017] Starting API task read test`);

    try {
      const createdTask = await taskAPI.createTask(authToken, {
        title: taskData.title,
        project_id: inboxProjectId
      });
      console.log(`[TC017] Task created with ID: ${createdTask.id}`);

      const retrievedTask = await taskAPI.getTask(authToken, createdTask.id);
      console.log(`[TC017] Task retrieved: ${JSON.stringify(retrievedTask)}`);

      expect(retrievedTask.id).toBe(createdTask.id);
      expect(retrievedTask.title).toBe(taskData.title);
      console.log(`[TC017] PASSED - Task read successfully via API`);
    } catch (error) {
      console.error(`[TC017] FAILED - API task read failed`);
      console.error(`[TC017] Error: ${getErrorMessage(error)}`);
      throw error;
    }
  });

  test('TC018: Should update task via API', async ({ taskAPI }) => {
    const originalTask = TestData.createTask('API Update Original');
    const updatedTitle = TestData.createUpdatedTask('API Update New').title;
    console.log(`\n[TC018] Starting API task update test`);
    console.log(`[TC018] Original: "${originalTask.title}"`);
    console.log(`[TC018] Updated: "${updatedTitle}"`);

    try {
      const createdTask = await taskAPI.createTask(authToken, {
        title: originalTask.title,
        project_id: inboxProjectId
      });
      console.log(`[TC018] Task created with ID: ${createdTask.id}`);

      const updatedTask = await taskAPI.updateTask(authToken, createdTask.id, {
        title: updatedTitle
      });
      console.log(`[TC018] Task updated: ${JSON.stringify(updatedTask)}`);

      expect(updatedTask.title).toBe(updatedTitle);
      expect(updatedTask.id).toBe(createdTask.id);
      console.log(`[TC018] PASSED - Task updated successfully via API`);
    } catch (error) {
      console.error(`[TC018] FAILED - API task update failed`);
      console.error(`[TC018] Error: ${getErrorMessage(error)}`);
      throw error;
    }
  });

  test('TC019: Should delete task via API', async ({ taskAPI }) => {
    const taskData = TestData.createTask('API Delete Task');
    console.log(`\n[TC019] Starting API task deletion test`);

    try {
      const createdTask = await taskAPI.createTask(authToken, {
        title: taskData.title,
        project_id: inboxProjectId
      });
      console.log(`[TC019] Task created with ID: ${createdTask.id}`);

      const statusCode = await taskAPI.deleteTask(authToken, createdTask.id);
      console.log(`[TC019] Delete status code: ${statusCode}`);

      expect(statusCode).toBe(200);
      console.log(`[TC019] PASSED - Task deleted successfully via API`);
    } catch (error) {
      console.error(`[TC019] FAILED - API task deletion failed`);
      console.error(`[TC019] Error: ${getErrorMessage(error)}`);
      throw error;
    }
  });

  test('TC020: Should mark task as complete via API', async ({ taskAPI }) => {
    const taskData = TestData.createTask('API Complete Task');
    console.log(`\n[TC020] Starting API task completion test`);
    console.log(`[TC020] Task title: "${taskData.title}"`);

    try {
      const createdTask = await taskAPI.createTask(authToken, {
        title: taskData.title,
        project_id: inboxProjectId
      });
      console.log(`[TC020] Task created with ID: ${createdTask.id}`);

      // Mark task as complete
      const completedTask = await taskAPI.updateTask(authToken, createdTask.id, { done: true });
      console.log(`[TC020] Task marked complete: done=${completedTask.done}`);

      expect(completedTask.done).toBe(true);
      expect(completedTask.id).toBe(createdTask.id);

      // Verify done status persists by re-fetching
      const retrievedTask = await taskAPI.getTask(authToken, createdTask.id);
      expect(retrievedTask.done).toBe(true);
      console.log(`[TC020] PASSED - Task completion status persists via API`);
    } catch (error) {
      console.error(`[TC020] FAILED - API task completion test failed`);
      console.error(`[TC020] Error: ${getErrorMessage(error)}`);
      throw error;
    }
  });
});
