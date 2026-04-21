import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TaskSelectors } from '../config/selectors/task.selectors';
import { WaitStrategy } from '../utils/WaitStrategy';

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

  async navigate(): Promise<void> {
    await this.navigateToUrl(TaskSelectors.OVERVIEW_ROUTE, 'domcontentloaded');
    await this.waitForVisible(this.taskInput);
  }

  async addTask(taskTitle: string): Promise<void> {
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

  async getTaskCount(): Promise<number> {
    return this.taskLinks.count();
  }

  async getTaskByTitle(title: string): Promise<Locator> {
    return this.getByRole('link', { name: title }).first();
  }

  async updateTask(oldTitle: string, newTitle: string): Promise<void> {
    await this.openTaskDetails(oldTitle);
    await this.editTaskTitle(oldTitle, newTitle);
    await this.navigate();
  }

  async deleteTask(taskTitle: string): Promise<void> {
    await this.openTaskDetails(taskTitle);
    await this.performDelete();
    await this.navigate();
  }

  async markTaskComplete(): Promise<void> {
    const checkbox = this.getByRole('img', { name: TaskSelectors.CHECKBOX_LABEL });
    await this.click(checkbox);
    await this.waitForPageLoad('domcontentloaded');
  }

  private async openTaskDetails(taskTitle: string): Promise<void> {
    const taskLink = await this.getTaskByTitle(taskTitle);
    await this.click(taskLink);
    await this.waitForPageLoad('networkidle');
  }

  private async editTaskTitle(oldTitle: string, newTitle: string): Promise<void> {
    const headingLocator = this.getByRole('heading', { name: oldTitle });
    
    await this.click(headingLocator);
    await this.fill(headingLocator, newTitle);
    await this.pressKey('Enter');
    await this.waitForPageLoad('networkidle');
  }

  private async performDelete(): Promise<void> {
    await this.click(this.deleteButton);
    await this.click(this.confirmDeleteButton);
    await this.waitForPageLoad('networkidle');
  }
}
