import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TaskSelectors } from '../config/page.config';
import { WaitStrategy } from '../utils/WaitStrategy';

/**
 * Task Page Object
 * Handles all task-related operations following Single Responsibility Principle
 * 
 * @class TaskPage
 * @extends BasePage
 */
export class TaskPage extends BasePage {
  // Locators - initialized lazily for better performance
  private get taskInput(): Locator {
    return this.getByRole('textbox', { name: TaskSelectors.TASK_INPUT_LABEL });
  }

  private get addTaskButton(): Locator {
    return this.getByRole('button', { name: TaskSelectors.ADD_BUTTON_LABEL, exact: true }).first();
  }

  private get deleteButton(): Locator {
    return this.getByRole('button', { name: TaskSelectors.DELETE_BUTTON_LABEL });
  }

  private get confirmDeleteButton(): Locator {
    return this.getByRole('button', { name: TaskSelectors.CONFIRM_DELETE_BUTTON_LABEL });
  }

  private get taskLinks(): Locator {
    return this.locator(TaskSelectors.TASK_LINK);
  }

  /**
   * Navigate to overview page (task list)
   * @returns Promise<void>
   */
  async navigate(): Promise<void> {
    await this.navigateToUrl(TaskSelectors.OVERVIEW_ROUTE);
    await this.waitForPageLoad('networkidle');
  }

  /**
   * Add a new task
   * @param taskTitle - Title of the task to create
   * @returns Promise<void>
   * @throws Error if task creation fails
   */
  async addTask(taskTitle: string): Promise<void> {
    await this.waitForPageLoad('networkidle');
    const initialCount = await this.getTaskCount();
    
    await this.click(this.taskInput);
    await this.fill(this.taskInput, taskTitle);
    await this.click(this.addTaskButton);
    
    // Wait for task to appear in the list
    await WaitStrategy.waitForCountIncrease(
      this.taskLinks,
      initialCount,
      this.config.SHORT_TIMEOUT
    );
  }

  /**
   * Get the total count of tasks
   * @returns Promise<number> - Number of tasks
   */
  async getTaskCount(): Promise<number> {
    try {
      await this.waitForPageLoad('networkidle');
      return await this.taskLinks.count();
    } catch (error) {
      // Return 0 if no tasks found or error occurs
      return 0;
    }
  }

  /**
   * Get task element by title
   * @param title - Task title to search for
   * @returns Locator - First matching task element
   */
  async getTaskByTitle(title: string): Promise<Locator> {
    return this.getByRole('link', { name: title }).first();
  }

  /**
   * Update an existing task
   * @param oldTitle - Current task title
   * @param newTitle - New task title
   * @returns Promise<void>
   * @throws Error if task update fails
   */
  async updateTask(oldTitle: string, newTitle: string): Promise<void> {
    await this.openTaskDetails(oldTitle);
    await this.editTaskTitle(oldTitle, newTitle);
    await this.navigate();
  }

  /**
   * Delete a task
   * @param taskTitle - Title of task to delete
   * @returns Promise<void>
   * @throws Error if task deletion fails
   */
  async deleteTask(taskTitle: string): Promise<void> {
    await this.openTaskDetails(taskTitle);
    await this.performDelete();
    await this.navigate();
  }

  /**
   * Mark a task as complete
   * @param taskTitle - Title of task to mark complete
   * @returns Promise<void>
   */
  async markTaskComplete(taskTitle: string): Promise<void> {
    const checkbox = this.getByRole('img', { name: TaskSelectors.CHECKBOX_LABEL });
    await this.click(checkbox);
    await this.waitForPageLoad('domcontentloaded');
  }

  /**
   * Open task details page
   * @private
   * @param taskTitle - Task title to open
   */
  private async openTaskDetails(taskTitle: string): Promise<void> {
    const taskLink = await this.getTaskByTitle(taskTitle);
    await this.click(taskLink);
    await this.waitForPageLoad('networkidle');
  }

  /**
   * Edit task title in detail view
   * @private
   * @param oldTitle - Current title
   * @param newTitle - New title
   */
  private async editTaskTitle(oldTitle: string, newTitle: string): Promise<void> {
    const headingLocator = this.getByRole('heading', { name: oldTitle });
    
    await this.click(headingLocator);
    await this.fill(headingLocator, newTitle);
    await this.pressKey('Enter');
    await this.waitForPageLoad('networkidle');
  }

  /**
   * Perform delete operation
   * @private
   */
  private async performDelete(): Promise<void> {
    await this.click(this.deleteButton);
    await this.click(this.confirmDeleteButton);
    await this.waitForPageLoad('networkidle');
  }
}
