import { APIRequestContext } from '@playwright/test';
import { Task, Project, CreateTaskRequest, UpdateTaskRequest, HttpStatusCode } from '../models/api.models';
import { retryWithBackoff } from '../utils/retry';

/**
 * Task API Helper
 * Handles task-related API operations
 */
export class TaskAPI {
  readonly context: APIRequestContext;
  readonly baseURL: string;

  constructor(context: APIRequestContext, baseURL: string = 'http://localhost:8080') {
    this.context = context;
    this.baseURL = baseURL;
  }

  /**
   * Create a new task
   * @param token - Authentication token
   * @param taskData - Task creation data
   * @returns Created task object
   */
  async createTask(token: string, taskData: CreateTaskRequest): Promise<Task> {
    const projectId = taskData.project_id ?? 1;
    return await retryWithBackoff(async () => {
      const response = await this.context.post(`${this.baseURL}/api/v1/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        data: taskData,
      });

      if (!response.ok()) {
        throw new Error(`Create task failed: ${response.status()} ${response.statusText()}`);
      }

      return response.json();
    });
  }

  /**
   * Get task by ID
   * @param token - Authentication token
   * @param taskId - Task ID
   * @returns Task object
   */
  async getTask(token: string, taskId: number): Promise<Task> {
    return await retryWithBackoff(async () => {
      const response = await this.context.get(`${this.baseURL}/api/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok()) {
        throw new Error(`Get task failed: ${response.status()} ${response.statusText()}`);
      }

      return response.json();
    });
  }

  /**
   * Update a task
   * @param token - Authentication token
   * @param taskId - Task ID
   * @param taskData - Updated task data
   * @returns Updated task object
   */
  async updateTask(token: string, taskId: number, taskData: UpdateTaskRequest): Promise<Task> {
    return await retryWithBackoff(async () => {
      const response = await this.context.post(`${this.baseURL}/api/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: taskData,
      });

      if (!response.ok()) {
        throw new Error(`Update task failed: ${response.status()} ${response.statusText()}`);
      }

      return response.json();
    });
  }

  /**
   * Delete a task
   * @param token - Authentication token
   * @param taskId - Task ID
   * @returns HTTP status code
   */
  async deleteTask(token: string, taskId: number): Promise<HttpStatusCode> {
    return await retryWithBackoff(async () => {
      const response = await this.context.delete(`${this.baseURL}/api/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.status();
    });
  }

  /**
   * Get all projects for the authenticated user
   * @param token - Authentication token
   * @returns Array of project objects
   */
  async getProjects(token: string): Promise<Project[]> {
    return await retryWithBackoff(async () => {
      const response = await this.context.get(`${this.baseURL}/api/v1/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok()) {
        throw new Error(`Get projects failed: ${response.status()} ${response.statusText()}`);
      }

      return response.json();
    });
  }

  /**
   * Get all tasks for a project
   * @param token - Authentication token
   * @param projectId - Project ID (default: 1 for Inbox)
   * @returns Array of tasks
   */
  async getAllTasks(token: string, projectId: number = 1): Promise<Task[]> {
    return await retryWithBackoff(async () => {
      const response = await this.context.get(`${this.baseURL}/api/v1/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok()) {
        throw new Error(`Get all tasks failed: ${response.status()} ${response.statusText()}`);
      }

      return response.json();
    });
  }
}
