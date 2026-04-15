import { test, expect } from '../fixtures/test.fixture';
import { TestData } from '../utils/testData';
import { getErrorMessage } from '../utils/errorHandler';
import { AuthSelectors } from '../config/page.config';

/**
 * Additional Authentication Tests
 *
 * NOTE: Priority tests (TC001-TC006) are in priority.spec.ts
 * This file contains supplementary authentication tests for additional coverage.
 * Test IDs: TC007-TC014
 */

test.describe('Authentication - Registration Tests', () => {
  test('TC007: Should validate required fields on registration', async ({ registerPage, page }) => {
    console.log(`\n[TC007] Starting registration validation test`);

    try {
      await registerPage.navigate();
      console.log(`[TC007] Navigated to registration page`);

      // Verify submit is disabled until required fields are filled
      const submitButton = page.getByRole('button', { name: 'CREATE ACCOUNT' });
      await expect(submitButton).toBeDisabled();
      console.log(`[TC007] Submit button is disabled as expected for empty required fields`);

      await expect(page).toHaveURL(/\/register/);
      console.log(`[TC007] ✓ PASSED - Form validation working correctly`);
    } catch (error) {
      console.error(`[TC007] ✗ FAILED - Validation test failed`);
      console.error(`[TC007] Error: ${getErrorMessage(error)}`);
      throw error;
    }
  });
});

test.describe('Authentication - Login Tests', () => {
  test('TC008: Should reject login with invalid credentials', async ({ loginPage, page }) => {
    const invalidUser = TestData.createInvalidUser();
    console.log(`\n[TC008] Starting invalid login test`);
    console.log(`[TC008] Test Data: email="${invalidUser.email}"`);

    try {
      await loginPage.navigate();
      console.log(`[TC008] Navigated to login page`);

      // fillAndSubmit fills the form and clicks without waiting for navigation,
      // so it does not throw when login is expected to fail.
      await loginPage.fillAndSubmit(invalidUser.email, invalidUser.password);
      console.log(`[TC008] Login form submitted with invalid credentials`);

      await expect(page).toHaveURL(/\/login/);
      console.log(`[TC008] ✓ PASSED - Invalid login rejected correctly`);
    } catch (error) {
      console.error(`[TC008] ✗ FAILED - Invalid login test failed`);
      console.error(`[TC008] Error: ${getErrorMessage(error)}`);
      console.error(`[TC008] Current URL: ${page.url()}`);
      throw error;
    }
  });

  test('TC009: Should reject login with non-existent user', async ({ loginPage, page }) => {
    const nonExistentUser = TestData.createUniqueUser();
    console.log(`\n[TC009] Starting non-existent user login test`);
    console.log(`[TC009] Test Data: email="${nonExistentUser.email}"`);

    try {
      await loginPage.navigate();
      console.log(`[TC009] Navigated to login page`);

      await loginPage.fillAndSubmit(nonExistentUser.email, nonExistentUser.password);
      console.log(`[TC009] Login form submitted for non-existent user`);

      await expect(page).toHaveURL(/\/login/);
      console.log(`[TC009] ✓ PASSED - Non-existent user login rejected`);
    } catch (error) {
      console.error(`[TC009] ✗ FAILED - Non-existent user test failed`);
      console.error(`[TC009] Error: ${getErrorMessage(error)}`);
      throw error;
    }
  });

  test('TC010: Should validate required fields on login', async ({ loginPage, page }) => {
    console.log(`\n[TC010] Starting login validation test`);

    try {
      await loginPage.navigate();
      console.log(`[TC010] Navigated to login page`);

      // Try to submit without filling fields
      await page.getByRole('button', { name: AuthSelectors.LOGIN_BUTTON_LABEL }).click();
      console.log(`[TC010] Clicked login without filling fields`);

      await expect(page).toHaveURL(/\/login/);
      console.log(`[TC010] ✓ PASSED - Login form validation working`);
    } catch (error) {
      console.error(`[TC010] ✗ FAILED - Login validation test failed`);
      console.error(`[TC010] Error: ${getErrorMessage(error)}`);
      throw error;
    }
  });
});

test.describe('Authentication - API Tests', () => {
  test('TC011: Should register and authenticate via API', async ({ authAPI }) => {
    const testUser = TestData.createUniqueUser();
    console.log(`\n[TC011] Starting API registration and login test`);
    console.log(`[TC011] Test Data: username="${testUser.username}", email="${testUser.email}"`);

    try {
      // Register via API
      const registrationResponse = await authAPI.register(
        testUser.username,
        testUser.email,
        testUser.password
      );
      console.log(`[TC011] Registration API response received`);
      expect(registrationResponse).toBeDefined();
      console.log(`[TC011] Registration successful via API`);

      // Login via API
      const token = await authAPI.login(testUser.email, testUser.password);
      console.log(`[TC011] Login API response received`);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      console.log(`[TC011] ✓ PASSED - API authentication successful, token: ${token.substring(0, 20)}...`);
    } catch (error) {
      console.error(`[TC011] ✗ FAILED - API authentication failed`);
      console.error(`[TC011] Error: ${getErrorMessage(error)}`);
      throw error;
    }
  });

  test('TC012: Should reject invalid API login', async ({ authAPI }) => {
    const invalidUser = TestData.createInvalidUser();
    console.log(`\n[TC012] Starting invalid API login test`);
    console.log(`[TC012] Test Data: email="${invalidUser.email}"`);

    await expect(
      authAPI.login(invalidUser.email, invalidUser.password)
    ).rejects.toThrow(/Login failed/);
    console.log(`[TC012] ✓ PASSED - API correctly rejected invalid credentials`);
  });

  test('TC013: Should get user info with valid token', async ({ authAPI, testUser, authToken }) => {
    console.log(`\n[TC013] Starting API user info retrieval test`);
    console.log(`[TC013] Test Data: email="${testUser.email}"`);

    try {
      // Get user info
      const userInfo = await authAPI.getUserInfo(authToken);
      console.log(`[TC013] User info retrieved: ${JSON.stringify(userInfo)}`);

      expect(userInfo).toBeDefined();
      expect(userInfo.username).toBe(testUser.username);
      expect(userInfo.id).toBeDefined();
      console.log(`[TC013] ✓ PASSED - User info retrieved successfully`);
    } catch (error) {
      console.error(`[TC013] ✗ FAILED - User info retrieval failed`);
      console.error(`[TC013] Error: ${getErrorMessage(error)}`);
      throw error;
    }
  });

  test('TC014: Should reject registration with duplicate email', async ({ authAPI }) => {
    const testUser = TestData.createUniqueUser();
    console.log(`\n[TC014] Starting duplicate email registration test`);
    console.log(`[TC014] Test Data: email="${testUser.email}"`);

    // First registration must succeed
    await authAPI.register(testUser.username, testUser.email, testUser.password);
    console.log(`[TC014] First registration successful`);

    // Second registration with the same email must be rejected
    await expect(
      authAPI.register(`${testUser.username}_dup`, testUser.email, testUser.password)
    ).rejects.toThrow(/Registration failed/);
    console.log(`[TC014] ✓ PASSED - Duplicate email registration correctly rejected`);
  });
});
