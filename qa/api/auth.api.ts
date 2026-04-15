import { APIRequestContext } from '@playwright/test';
import { AuthResponse, RegistrationResponse, UserInfo } from '../models/api.models';
import { retryWithBackoff } from '../utils/retry';
import { RuntimeConfig } from '../config/runtime';

/**
 * Authentication API Helper
 * Handles user login and token management for API requests
 */
export class AuthAPI {
  readonly context: APIRequestContext;
  readonly baseURL: string;
  private static authRequestQueue: Promise<void> = Promise.resolve();

  constructor(context: APIRequestContext, baseURL: string = RuntimeConfig.environment.baseUrl) {
    this.context = context;
    this.baseURL = baseURL;
  }

  private async enqueueAuthRequest<T>(operation: () => Promise<T>): Promise<T> {
    const throttled = AuthAPI.authRequestQueue.then(async () => {
      const result = await operation();
      const throttleMs = Number(process.env.AUTH_API_THROTTLE_MS ?? '1200');
      await new Promise(resolve => setTimeout(resolve, throttleMs));
      return result;
    });

    AuthAPI.authRequestQueue = throttled.then(
      () => undefined,
      () => undefined
    );

    return throttled;
  }

  /**
   * Login user and get authentication token
   * @param email - User email
   * @param password - User password
   * @returns Authentication token
   */
  async login(email: string, password: string): Promise<string> {
    return await this.enqueueAuthRequest(async () => {
      return await retryWithBackoff(async () => {
        const response = await this.context.post(`${this.baseURL}/api/v1/login`, {
          data: {
            long_token: true,
            password: password,
            username: email,
          },
        });

        if (!response.ok()) {
          throw new Error(`Login failed: ${response.status()} ${response.statusText()}`);
        }

        const responseBody = await response.json();
        return responseBody.token;
      });
    });
  }

  /**
   * Register a new user
   * @param username - Username
   * @param email - Email address
   * @param password - Password
   * @returns Registration response
   */
  async register(username: string, email: string, password: string): Promise<RegistrationResponse> {
    return await this.enqueueAuthRequest(async () => {
      return await retryWithBackoff(async () => {
        const response = await this.context.post(`${this.baseURL}/api/v1/register`, {
          data: {
            username: username,
            email: email,
            password: password,
          },
        });

        if (!response.ok()) {
          throw new Error(`Registration failed: ${response.status()} ${response.statusText()}`);
        }

        return response.json();
      });
    });
  }

  /**
   * Get current user info
   * @param token - Authentication token
   * @returns User information
   */
  async getUserInfo(token: string): Promise<UserInfo> {
    return await retryWithBackoff(async () => {
      const response = await this.context.get(`${this.baseURL}/api/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok()) {
        throw new Error(`Get user info failed: ${response.status()} ${response.statusText()}`);
      }

      return response.json();
    });
  }
}
