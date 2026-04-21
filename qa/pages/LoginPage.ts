import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { AuthSelectors } from '../config/selectors/auth.selectors';
import { envNumber } from '../config/env';

export class LoginPage extends BasePage {
  private static readonly MAX_LOGIN_ATTEMPTS = envNumber('LOGIN_MAX_ATTEMPTS', 6);

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

  async navigate(): Promise<void> {
    await this.navigateToUrl(AuthSelectors.LOGIN_ROUTE, 'networkidle');
    // Wait for the form to be fully interactive after SPA hydration
    await this.waitForVisible(this.emailInput);
  }

  private async isRateLimited(): Promise<boolean> {
    try {
      await this.page.getByText(AuthSelectors.TOO_MANY_REQUESTS_TEXT).waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async fillAndSubmit(email: string, password: string): Promise<void> {
    await this.waitForVisible(this.emailInput, this.config.LONG_TIMEOUT);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  async login(email: string, password: string): Promise<void> {
    for (let attempt = 1; attempt <= LoginPage.MAX_LOGIN_ATTEMPTS; attempt++) {
      if (!this.getCurrentUrl().includes(AuthSelectors.LOGIN_ROUTE)) {
        await this.navigate();
      }

      await this.fillAndSubmit(email, password);

      if (await this.isRateLimited()) {
        if (attempt === LoginPage.MAX_LOGIN_ATTEMPTS) {
          throw new Error('Login failed due to repeated 429 Too Many Requests responses.');
        }

        const baseMs = Math.min(15000, 3000 * attempt);
        // Add jitter so parallel workers desync and don't retry simultaneously
        const jitter = Math.random() * Math.min(5000, baseMs);
        const backoffMs = Math.round(baseMs + jitter);
        await this.page.waitForTimeout(backoffMs);
        await this.navigate();
        continue;
      }

      await this.waitForUrl('/', this.config.NAVIGATION_TIMEOUT);
      await this.waitForPageLoad('domcontentloaded');
      return;
    }
  }
}
