import { Page, Locator } from '@playwright/test';

/**
 * Wait strategy utility class
 * Encapsulates common wait patterns following Strategy Pattern
 * 
 * @class WaitStrategy
 */
export class WaitStrategy {
  /**
   * Wait for element count to change
   * @param locator - Element locator
   * @param expectedCount - Expected element count
   * @param timeout - Maximum wait time
   */
  static async waitForCountChange(
    locator: Locator,
    expectedCount: number,
    timeout: number = 5000
  ): Promise<void> {
    await locator.nth(expectedCount - 1).waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element count to increase
   * @param locator - Element locator
   * @param initialCount - Initial element count
   * @param timeout - Maximum wait time
   */
  static async waitForCountIncrease(
    locator: Locator,
    initialCount: number,
    timeout: number = 5000
  ): Promise<void> {
    await this.waitForCountChange(locator, initialCount + 1, timeout);
  }

  /**
   * Wait for element count to decrease
   * @param locator - Element locator
   * @param initialCount - Initial element count
   * @param timeout - Maximum wait time
   */
  static async waitForCountDecrease(
    locator: Locator,
    initialCount: number,
    timeout: number = 5000
  ): Promise<void> {
    const expectedCount = Math.max(0, initialCount - 1);
    if (expectedCount === 0) {
      // Wait for all elements to be hidden
      await locator.first().waitFor({ state: 'hidden', timeout }).catch(() => {
        // It's okay if the locator doesn't exist
      });
    } else {
      await this.waitForCountChange(locator, expectedCount, timeout);
    }
  }

  /**
   * Wait for page navigation
   * @param page - Playwright page instance
   * @param state - Load state to wait for
   */
  static async waitForNavigation(
    page: Page,
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'
  ): Promise<void> {
    await page.waitForLoadState(state);
  }

  /**
   * Wait for element to be actionable (visible and enabled)
   * @param locator - Element locator
   * @param timeout - Maximum wait time
   */
  static async waitForActionable(
    locator: Locator,
    timeout: number = 5000
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.waitFor({ state: 'attached', timeout });
  }
}
