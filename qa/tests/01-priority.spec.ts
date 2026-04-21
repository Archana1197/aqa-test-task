import { test, expect } from '../fixtures/test.fixture';
import { TestData } from '../utils/testData';

test.describe('PRIORITY - Authentication Tests', () => {
  test('TC001: User Registration - Should successfully register with unique credentials', async ({ registerPage, page }) => {
    const testUser = TestData.createUniqueUser();

    await registerPage.navigate();
    await registerPage.register(testUser.username, testUser.email, testUser.password);

    await expect(page).toHaveURL('/');
  });

  test('TC002: User Login - Should successfully login with valid credentials', async ({ registerPage, loginPage, page }) => {
    const testUser = TestData.createUniqueUser();

    await registerPage.navigate();
    await registerPage.register(testUser.username, testUser.email, testUser.password);
    await expect(page).toHaveURL('/');

    await page.context().clearCookies();
    await page.evaluate('window.localStorage.clear(); window.sessionStorage.clear();');

    await loginPage.navigate();
    await loginPage.login(testUser.email, testUser.password);

    await expect(page).toHaveURL('/');
  });
});

test.describe('PRIORITY - Task CRUD Tests', () => {
  test('TC003: CREATE Task - Should create a task via UI', async ({ taskPage, authenticatedPage }) => {
    const taskData = TestData.createTask('Priority Create Task');

    await taskPage.navigate();
    const initialCount = await taskPage.getTaskCount();

    await taskPage.addTask(taskData.title);

    const updatedCount = await taskPage.getTaskCount();
    expect(updatedCount).toBe(initialCount + 1);

    const task = await taskPage.getTaskByTitle(taskData.title);
    await expect(task).toBeVisible();
  });

  test('TC004: READ Task - Should read and verify task details via UI', async ({ taskPage, authenticatedPage }) => {
    const taskData = TestData.createTask('Priority Read Task');

    await taskPage.navigate();
    await taskPage.addTask(taskData.title);

    const task = await taskPage.getTaskByTitle(taskData.title);
    await expect(task).toBeVisible();
    await expect(task).toContainText(taskData.title);
  });

  test('TC005: UPDATE Task - Should update task title via UI', async ({ taskPage, authenticatedPage }) => {
    const originalTask = TestData.createTask('Priority Original Task');
    const updatedTask = TestData.createUpdatedTask('Priority Updated Task');

    await taskPage.navigate();
    await taskPage.addTask(originalTask.title);
    await taskPage.updateTask(originalTask.title, updatedTask.title);

    const task = await taskPage.getTaskByTitle(updatedTask.title);
    await expect(task).toBeVisible();
  });

  test('TC006: DELETE Task - Should delete a task via UI', async ({ taskPage, authenticatedPage }) => {
    const taskData = TestData.createTask('Priority Delete Task');

    await taskPage.navigate();
    await taskPage.addTask(taskData.title);
    await taskPage.deleteTask(taskData.title);

    const deletedTask = await taskPage.getTaskByTitle(taskData.title);
    await expect(deletedTask).toHaveCount(0);
  });
});
