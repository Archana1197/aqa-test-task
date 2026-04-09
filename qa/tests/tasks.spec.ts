import { test, expect } from '../fixtures/test.fixture';
import { testData } from '../utils/testData';

test.describe('Task Management Tests', () => {
  test('Complete Task Flow - Create, View, Update, Delete', async ({ loginPage, taskPage, page }) => {
    // Step 1: Register (if needed)
    console.log('\n=== Step 1: Registration ===');
    try {
      await page.goto('/register', { timeout: 5000 });
      await page.getByLabel('Username').fill(testData.credentials.validUser.username, { timeout: 2000 });
      await page.getByLabel('Email address').fill(testData.credentials.validUser.email);
      await page.getByLabel('Password', { exact: true }).fill(testData.credentials.validUser.password);
      await page.getByRole('button', { name: 'CREATE ACCOUNT' }).click();
      await page.waitForURL((url) => !url.pathname.includes('/register'), { timeout: 5000 });
      console.log('Registration successful or user already exists');
    } catch (error) {
      console.log('User already exists, proceeding to login');
    }
    
    // Step 2: Login
    console.log('\n=== Step 2: Login ===');
    await loginPage.navigate();
    await loginPage.login(testData.credentials.validUser.email, testData.credentials.validUser.password);
    console.log('Login successful');
    
    // Step 3: Create a new task
    console.log('\n=== Step 3: Creating new task ===');
    await taskPage.navigate();
    const initialCount = await taskPage.getTaskCount();
    console.log(`Initial task count: ${initialCount}`);
    
    await taskPage.addTask(testData.tasks.newTask.title);
    console.log(`Task created: ${testData.tasks.newTask.title}`);
    
    // Task should already be visible - no reload needed
    const updatedCount = await taskPage.getTaskCount();
    console.log(`Updated task count: ${updatedCount}`);
    expect(updatedCount).toBe(initialCount + 1);
    console.log('✓ Task count increased correctly');
    
    // Step 4: Verify task is visible in the list
    console.log('\n=== Step 4: Verifying task visibility ===');
    const task = await taskPage.getTaskByTitle(testData.tasks.newTask.title);
    await expect(task).toBeVisible();
    console.log('✓ Task is visible in the list');
    
    // Step 5: Read task details
    console.log('\n=== Step 5: Reading task details ===');
    await expect(task).toContainText(testData.tasks.newTask.title);
    console.log('✓ Task contains correct title');
    
    // Step 6: Update the task
    console.log('\n=== Step 6: Updating task ===');
    const oldTitle = testData.tasks.newTask.title;
    const newTitle = testData.tasks.updateTask.title;
    console.log(`Updating from: ${oldTitle} to: ${newTitle}`);
    
    await taskPage.updateTask(oldTitle, newTitle);
    
    const updatedTask = await taskPage.getTaskByTitle(newTitle);
    await expect(updatedTask).toBeVisible();
    console.log('✓ Task updated successfully');
    
    // Step 7: Delete the task
    console.log('\n=== Step 7: Deleting task ===');
    const countBeforeDelete = await taskPage.getTaskCount();
    console.log(`Task count before delete: ${countBeforeDelete}`);
    
    await taskPage.deleteTask(newTitle);
    
    const finalCount = await taskPage.getTaskCount();
    console.log(`Task count after delete: ${finalCount}`);
    expect(finalCount).toBe(countBeforeDelete - 1);
    console.log('✓ Task deleted successfully');
    
    console.log('\n=== All tests passed! ===\n');
  });
});
