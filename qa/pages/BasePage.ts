import { Page, Locator } from '@playwright/test';
import { PageConfig } from '../config/page.config';

/**
 * Base Page Object class providing common functionality for all page objects.
 * Follows the Single Responsibility Principle by handling only common page operations.
 * 
 * @class BasePage
 * @abstract
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly config: typeof PageConfig;

  constructor(page: Page) {
    this.page = page;
    this.config = PageConfig;
  }

  /**
   * Navigate to a specific URL with optional wait strategy
   * @param url - Relative or absolute URL to navigate to
   * @param waitUntil - Load state to wait for (default: networkidle)
   */
  protected async navigateToUrl(
    url: string,
    waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'
  ): Promise<void> {
    await this.page.goto(url, { waitUntil });
  }

  /**
   * Wait for the page to be fully loaded
   * @param state - The load state to wait for
   */
  protected async waitForPageLoad(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  /**
   * Wait for a specific URL pattern
   * @param urlPattern - URL pattern to match (string or regex)
   * @param timeout - Maximum wait time in milliseconds
   */
  protected async waitForUrl(
    urlPattern: string | RegExp,
    timeout: number = this.config.DEFAULT_TIMEOUT
  ): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Get element by role with enhanced error handling
   * @param role - ARIA role
   * @param options - Additional locator options
   */
  protected getByRole(
    role: Parameters<Page['getByRole']>[0],
    options?: Parameters<Page['getByRole']>[1]
  ): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Get element by label with enhanced error handling
   * @param label - Label text
   * @param options - Additional locator options
   */
  protected getByLabel(
    label: string,
    options?: Parameters<Page['getByLabel']>[1]
  ): Locator {
    return this.page.getByLabel(label, options);
  }

  /**
   * Get element by test ID
   * @param testId - Test ID attribute value
   */
  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Create a locator with a CSS selector
   * @param selector - CSS selector
   */
  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Wait for element to be visible
   * @param locator - Element locator
   * @param timeout - Maximum wait time
   */
  protected async waitForVisible(
    locator: Locator,
    timeout: number = this.config.DEFAULT_TIMEOUT
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   * @param locator - Element locator
   * @param timeout - Maximum wait time
   */
  protected async waitForHidden(
    locator: Locator,
    timeout: number = this.config.DEFAULT_TIMEOUT
  ): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Fill input field.
   * Playwright's fill() already waits for the element to be visible and editable.
   * @param locator - Input element locator
   * @param value - Value to fill
   */
  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /**
   * Click element.
   * Playwright's click() already waits for the element to be visible, stable, and enabled.
   * @param locator - Element locator
   */
  protected async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Get current page URL
   */
  protected getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Press keyboard key
   * @param key - Key to press
   */
  protected async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }
}
