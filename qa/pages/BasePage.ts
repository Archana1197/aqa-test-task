import { Page, Locator } from '@playwright/test';
import { PageConfig } from '../config/page.config';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly config: typeof PageConfig;

  constructor(page: Page) {
    this.page = page;
    this.config = PageConfig;
  }

  protected async navigateToUrl(
    url: string,
    waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'
  ): Promise<void> {
    await this.page.goto(url, { waitUntil });
  }

  protected async waitForPageLoad(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  protected async waitForUrl(
    urlPattern: string | RegExp,
    timeout: number = this.config.DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  protected getByRole(
    role: Parameters<Page['getByRole']>[0],
    options?: Parameters<Page['getByRole']>[1]
  ): Locator {
    return this.page.getByRole(role, options);
  }

  protected getByLabel(
    label: string,
    options?: Parameters<Page['getByLabel']>[1]
  ): Locator {
    return this.page.getByLabel(label, options);
  }

  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  protected async waitForVisible(
    locator: Locator,
    timeout: number = this.config.DEFAULT_TIMEOUT
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  protected async waitForHidden(
    locator: Locator,
    timeout: number = this.config.DEFAULT_TIMEOUT
  ): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  protected async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  protected getCurrentUrl(): string {
    return this.page.url();
  }

  protected async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }
}
