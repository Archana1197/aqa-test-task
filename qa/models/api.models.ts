/**
 * API response models and type definitions
 * Provides type safety for API interactions
 */

/**
 * User authentication response
 */
export interface AuthResponse {
  token: string;
  [key: string]: unknown;
}

/**
 * User registration response
 */
export interface RegistrationResponse {
  id: number;
  username: string;
  email: string;
  created: string;
  updated: string;
  [key: string]: unknown;
}

/**
 * User information response
 */
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  created: string;
  updated: string;
  [key: string]: unknown;
}

/**
 * Task object
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  done?: boolean;
  created: string;
  updated: string;
  project_id?: number;
  [key: string]: unknown;
}

/**
 * Task creation request
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  project_id?: number;
  done?: boolean;
}

/**
 * Task update request
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  done?: boolean;
}

/**
 * HTTP status code type
 */
export type HttpStatusCode = number;
