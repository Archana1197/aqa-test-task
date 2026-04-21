import { test, expect } from '../fixtures/test.fixture';
import { TestData } from '../utils/testData';
import { AuthSelectors } from '../config/selectors/auth.selectors';

test.describe('Authentication - Registration Tests', () => {
  test('TC007: Should validate required fields on registration', async ({ registerPage, page }) => {
    await registerPage.navigate();

    const submitButton = page.getByRole('button', { name: AuthSelectors.REGISTER_BUTTON_LABEL });
    await expect(submitButton).toBeDisabled();
    await expect(page).toHaveURL(new RegExp(`${AuthSelectors.REGISTER_ROUTE}$`));
  });
});

test.describe('Authentication - Login Tests', () => {
  test('TC008: Should reject login with invalid credentials', async ({ loginPage, page }) => {
    const invalidUser = TestData.createInvalidUser();

    await loginPage.navigate();
    await loginPage.fillAndSubmit(invalidUser.email, invalidUser.password);

    await expect(page).toHaveURL(new RegExp(`${AuthSelectors.LOGIN_ROUTE}$`));
  });

  test('TC009: Should reject login with non-existent user', async ({ loginPage, page }) => {
    const nonExistentUser = TestData.createUniqueUser();

    await loginPage.navigate();
    await loginPage.fillAndSubmit(nonExistentUser.email, nonExistentUser.password);

    await expect(page).toHaveURL(new RegExp(`${AuthSelectors.LOGIN_ROUTE}$`));
  });

  test('TC010: Should validate required fields on login', async ({ loginPage, page }) => {
    await loginPage.navigate();
    await page.getByRole('button', { name: AuthSelectors.LOGIN_BUTTON_LABEL }).click();

    await expect(page).toHaveURL(new RegExp(`${AuthSelectors.LOGIN_ROUTE}$`));
  });
});

test.describe('Authentication - API Tests', () => {
  test('TC011: Should register and authenticate via API', async ({ authAPI }) => {
    const testUser = TestData.createUniqueUser();

    const registrationResponse = await authAPI.register(
      testUser.username,
      testUser.email,
      testUser.password
    );
    expect(registrationResponse).toBeDefined();

    const token = await authAPI.login(testUser.email, testUser.password);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('TC012: Should reject invalid API login', async ({ authAPI }) => {
    const invalidUser = TestData.createInvalidUser();

    await expect(
      authAPI.login(invalidUser.email, invalidUser.password)
    ).rejects.toThrow(/login failed/i);
  });

  test('TC013: Should get user info with valid token', async ({ authAPI, testUser, authToken }) => {
    const userInfo = await authAPI.getUserInfo(authToken);

    expect(userInfo).toBeDefined();
    expect(userInfo.username).toBe(testUser.username);
    expect(userInfo.id).toBeDefined();
  });

  test('TC014: Should reject registration with duplicate email', async ({ authAPI }) => {
    const testUser = TestData.createUniqueUser();

    await authAPI.register(testUser.username, testUser.email, testUser.password);

    await expect(
      authAPI.register(`${testUser.username}_dup`, testUser.email, testUser.password)
    ).rejects.toThrow(/register failed/i);
  });
});
