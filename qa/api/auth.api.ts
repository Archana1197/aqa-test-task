import { AuthResponse, RegistrationResponse, UserInfo } from '../models/api.models';
import { envNumber } from '../config/env';
import { BaseAPI } from './base.api';

export class AuthAPI extends BaseAPI {
  async login(email: string, password: string): Promise<string> {
    const response = await this.postJson<AuthResponse>('/api/v1/login', {
      data: {
        long_token: true,
        password,
        username: email,
      },
    });

    const throttleMs = envNumber('AUTH_API_THROTTLE_MS', 1200);
    if (throttleMs > 0) {
      await new Promise(resolve => setTimeout(resolve, throttleMs));
    }

    return response.token;
  }

  async register(username: string, email: string, password: string): Promise<RegistrationResponse> {
    const response = await this.postJson<RegistrationResponse>('/api/v1/register', {
      data: {
        username,
        email,
        password,
      },
    });

    const throttleMs = envNumber('AUTH_API_THROTTLE_MS', 1200);
    if (throttleMs > 0) {
      await new Promise(resolve => setTimeout(resolve, throttleMs));
    }

    return response;
  }

  async getUserInfo(token: string): Promise<UserInfo> {
    return this.getJson<UserInfo>('/api/v1/user', {
      token,
    });
  }
}
