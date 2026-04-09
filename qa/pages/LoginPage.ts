import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { AuthSelectors } from '../config/page.config';

/**
 * Login Page Object
 * Handles user authentication operations
 * 
 * @class LoginPage
 * @extends BasePage
 */
export class LoginPage extends BasePage {
  // Lazy-loaded locators for better performance
  private get emailInput(): Locator {
    return this.getByLabel(AuthSelectors.LOGIN_EMAIL_LABEL);
  }

  private get passwordInput(): Locator {
    return this.getByLabel(AuthSelectors.LOGIN_PASSWORD_LABEL, { exact: true });
  }

  private get loginButton(): Locator {
    return this.getByRole('button', { name: AuthSelectors.LOGIN_BUTTON_LABEL });
  }

  /**
   * Navigate to login page
   * @returns Promise<void>
   */
  async navigate(): Promise<void> {
    await this.navigateToUrl('/');
  }

  /**
   * Perform login operation
   * @param email - User email or username
   * @param password - User password
   * @returns Promise<void>
   * @throws Error if login fails
   */
  async login(email: string, password: string): Promise<void> {
    await this.waitForVisible(this.emailInput);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    
    // Wait for successful login - navigates away from login page
    await this.waitForUrlChange(
      /\/login/,
      this.config.NAVIGATION_TIMEOUT
    );
    await this.waitForPageLoad('networkidle');
  }
}
