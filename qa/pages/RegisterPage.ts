import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { AuthSelectors } from '../config/page.config';

/**
 * Register Page Object
 * Handles user registration operations
 * 
 * @class RegisterPage
 * @extends BasePage
 */
export class RegisterPage extends BasePage {
  // Lazy-loaded locators for better performance
  private get usernameInput(): Locator {
    return this.getByLabel(AuthSelectors.REGISTER_USERNAME_LABEL);
  }

  private get emailInput(): Locator {
    return this.getByLabel(AuthSelectors.REGISTER_EMAIL_LABEL);
  }

  private get passwordInput(): Locator {
    return this.getByLabel(AuthSelectors.REGISTER_PASSWORD_LABEL, { exact: true });
  }

  private get registerButton(): Locator {
    return this.getByRole('button', { name: AuthSelectors.REGISTER_BUTTON_LABEL });
  }

  /**
   * Navigate to registration page
   * @returns Promise<void>
   */
  async navigate(): Promise<void> {
    await this.navigateToUrl(AuthSelectors.REGISTER_ROUTE);
  }

  /**
   * Perform user registration
   * @param username - Desired username
   * @param email - User email address
   * @param password - User password
   * @returns Promise<void>
   * @throws Error if registration fails
   */
  async register(username: string, email: string, password: string): Promise<void> {
    await this.waitForVisible(this.usernameInput);
    await this.fill(this.usernameInput, username);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.registerButton);
    await this.waitForUrl('/', 30000);
  }
}
