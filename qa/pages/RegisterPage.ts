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
  private static readonly MAX_REGISTER_ATTEMPTS = Number(process.env.REGISTER_MAX_ATTEMPTS ?? '5');

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

  private async isRateLimited(): Promise<boolean> {
    try {
      await this.page.getByText('Too Many Requests').waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
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
    for (let attempt = 1; attempt <= RegisterPage.MAX_REGISTER_ATTEMPTS; attempt++) {
      await this.waitForVisible(this.usernameInput);
      await this.fill(this.usernameInput, username);
      await this.fill(this.emailInput, email);
      await this.fill(this.passwordInput, password);
      await this.click(this.registerButton);

      let registrationSucceeded = false;
      try {
        await this.waitForUrl('/', 10000);
        registrationSucceeded = true;
      } catch {
        registrationSucceeded = false;
      }

      if (registrationSucceeded) {
        return;
      }

      const isStillOnRegister = this.getCurrentUrl().includes(AuthSelectors.REGISTER_ROUTE);
      if (await this.isRateLimited() || isStillOnRegister) {
        if (attempt === RegisterPage.MAX_REGISTER_ATTEMPTS) {
          throw new Error('Registration failed due to repeated 429 Too Many Requests responses.');
        }

        const backoffMs = Math.min(12000, 2500 * attempt);
        await this.page.waitForTimeout(backoffMs);
        await this.navigate();
        continue;
      }

      throw new Error('Registration failed without redirect to home page.');
    }
  }
}
