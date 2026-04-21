import { Task, Project, CreateTaskRequest, UpdateTaskRequest, HttpStatusCode } from '../models/api.models';
import { HttpError } from '../utils/errors';
import { BaseAPI } from './base.api';

export class TaskAPI extends BaseAPI {
  async createTask(token: string, taskData: CreateTaskRequest): Promise<Task> {
    const projectId = taskData.project_id ?? 1;
    const path = `/api/v1/projects/${projectId}/tasks`;

    try {
      return await this.postJson<Task>(path, {
        token,
        data: taskData,
      });
    } catch (error) {
      if (error instanceof HttpError && error.status === 405) {
        return await this.putJson<Task>(path, {
          token,
          data: taskData,
        });
      }
      throw error;
    }
  }

  async getTask(token: string, taskId: number): Promise<Task> {
    return this.getJson<Task>(`/api/v1/tasks/${taskId}`, {
      token,
    });
  }

  async updateTask(token: string, taskId: number, taskData: UpdateTaskRequest): Promise<Task> {
    return this.postJson<Task>(`/api/v1/tasks/${taskId}`, {
      token,
      data: taskData,
    });
  }

  async deleteTask(token: string, taskId: number): Promise<HttpStatusCode> {
    return this.deleteStatus(`/api/v1/tasks/${taskId}`, {
      token,
    });
  }

  async getProjects(token: string): Promise<Project[]> {
    return this.getJson<Project[]>('/api/v1/projects', {
      token,
    });
  }

  async getAllTasks(token: string, projectId: number = 1): Promise<Task[]> {
    return this.getJson<Task[]>(`/api/v1/projects/${projectId}/tasks`, {
      token,
    });
  }
}
