import { test, expect } from '../fixtures/test.fixture';
import { TestData } from '../utils/testData';

test.describe('Task Management - UI Read Tests', () => {
  test('TC015: Should display correct task count', async ({ taskPage, authenticatedPage }) => {
    await taskPage.navigate();
    const initialCount = await taskPage.getTaskCount();

    const task1 = TestData.createTask('Count Test 1');
    const task2 = TestData.createTask('Count Test 2');

    await taskPage.addTask(task1.title);
    await taskPage.addTask(task2.title);

    const finalCount = await taskPage.getTaskCount();

    expect(finalCount).toBeGreaterThanOrEqual(initialCount + 2);
    await expect(await taskPage.getTaskByTitle(task1.title)).toBeVisible();
    await expect(await taskPage.getTaskByTitle(task2.title)).toBeVisible();
  });
});

test.describe('Task Management - API Only Tests', () => {
  test.describe.configure({ timeout: 180000 });

  test('TC016: Should create task via API', async ({ taskAPI, authToken }) => {
    const taskData = TestData.createTask('API Create Task');
    const projects = await taskAPI.getProjects(authToken);
    const inbox = projects.find(p => String(p.title).toLowerCase() === 'inbox') ?? projects[0];

    const createdTask = await taskAPI.createTask(authToken, {
      title: taskData.title,
      project_id: inbox.id,
    });

    expect(createdTask.title).toBe(taskData.title);
    expect(createdTask.id).toBeDefined();
  });

  test('TC017: Should read task via API', async ({ taskAPI, authToken }) => {
    const taskData = TestData.createTask('API Read Task');
    const projects = await taskAPI.getProjects(authToken);
    const inbox = projects.find(p => String(p.title).toLowerCase() === 'inbox') ?? projects[0];

    const createdTask = await taskAPI.createTask(authToken, {
      title: taskData.title,
      project_id: inbox.id,
    });

    const retrievedTask = await taskAPI.getTask(authToken, createdTask.id);

    expect(retrievedTask.id).toBe(createdTask.id);
    expect(retrievedTask.title).toBe(taskData.title);
  });

  test('TC018: Should update task via API', async ({ taskAPI, authToken }) => {
    const originalTask = TestData.createTask('API Update Original');
    const updatedTitle = TestData.createUpdatedTask('API Update New').title;
    const projects = await taskAPI.getProjects(authToken);
    const inbox = projects.find(p => String(p.title).toLowerCase() === 'inbox') ?? projects[0];

    const createdTask = await taskAPI.createTask(authToken, {
      title: originalTask.title,
      project_id: inbox.id,
    });

    const updatedTask = await taskAPI.updateTask(authToken, createdTask.id, {
      title: updatedTitle,
    });

    expect(updatedTask.title).toBe(updatedTitle);
    expect(updatedTask.id).toBe(createdTask.id);
  });

  test('TC019: Should delete task via API', async ({ taskAPI, authToken }) => {
    const taskData = TestData.createTask('API Delete Task');
    const projects = await taskAPI.getProjects(authToken);
    const inbox = projects.find(p => String(p.title).toLowerCase() === 'inbox') ?? projects[0];

    const createdTask = await taskAPI.createTask(authToken, {
      title: taskData.title,
      project_id: inbox.id,
    });

    const statusCode = await taskAPI.deleteTask(authToken, createdTask.id);
    expect(statusCode).toBe(200);
  });

  test('TC020: Should mark task as complete via API', async ({ taskAPI, authToken }) => {
    const taskData = TestData.createTask('API Complete Task');
    const projects = await taskAPI.getProjects(authToken);
    const inbox = projects.find(p => String(p.title).toLowerCase() === 'inbox') ?? projects[0];

    const createdTask = await taskAPI.createTask(authToken, {
      title: taskData.title,
      project_id: inbox.id,
    });

    const completedTask = await taskAPI.updateTask(authToken, createdTask.id, { done: true });
    expect(completedTask.done).toBe(true);
    expect(completedTask.id).toBe(createdTask.id);

    const retrievedTask = await taskAPI.getTask(authToken, createdTask.id);
    expect(retrievedTask.done).toBe(true);
  });
});
