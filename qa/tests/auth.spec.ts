import { test, expect } from '../fixtures/test.fixture';
import { testData } from '../utils/testData';

test.describe('Authentication Tests', () => {
  test('should register a new user', async ({ registerPage }) => {
    const randomEmail = testData.generateRandomEmail();
    const randomUsername = testData.generateRandomUsername();

    await registerPage.navigate();
    await registerPage.register(randomUsername, randomEmail, testData.credentials.validUser.password);

    // After successful registration, user is redirected to root page
    await expect(registerPage.page).toHaveURL('http://localhost:8080/');
  });

  test('should login with valid credentials', async ({ loginPage, page }) => {
    const testUser = testData.credentials.validUser;
    
    await loginPage.navigate();
    await loginPage.login(testUser.email, testUser.password);

    // After successful login, user is redirected to root page
    await expect(page).toHaveURL('http://localhost:8080/');
  });

  test('should show error on invalid login', async ({ loginPage, page }) => {
    const invalidUser = testData.credentials.invalidUser;
    
    await loginPage.navigate();
    await loginPage.emailInput.fill(invalidUser.email);
    await loginPage.passwordInput.fill(invalidUser.password);
    await loginPage.loginButton.click();

    // Should stay on login page - wait a bit for error to appear
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/.*login/);
  });
});
