import { APIRequestContext } from '@playwright/test';
import { RuntimeConfig } from '../config/runtime';
import { DatabaseSeeder, SeededUser, SeedUserInput } from '../data/databaseSeeder';
import { ResourcePool } from './resourcePool';

export class TestOrchestrator {
  private readonly userPool = new ResourcePool<SeededUser>(
    Number(process.env.USER_POOL_SIZE ?? RuntimeConfig.environment.playwright.workers)
  );
  private readonly pooledUsers = new Set<SeededUser>();

  async createIsolatedUser(user: SeedUserInput): Promise<SeededUser> {
    const seeded = await DatabaseSeeder.createTestUser(user);
    if (!RuntimeConfig.features.enableResourcePooling) {
      return seeded;
    }

    const acquired = this.userPool.acquire(() => seeded);
    this.pooledUsers.add(acquired);
    return acquired;
  }

  async releaseUser(user: SeededUser): Promise<void> {
    if (this.pooledUsers.has(user)) {
      this.userPool.release(user);
      this.pooledUsers.delete(user);
    }
    await DatabaseSeeder.cleanupUserByEmail(user.email);
  }

  async runHealthCheck(request: APIRequestContext, baseUrl: string): Promise<void> {
    const endpoint = RuntimeConfig.environment.monitoring.healthEndpoint;
    const response = await request.get(`${baseUrl}${endpoint}`);
    if (!response.ok()) {
      throw new Error(
        `Health check failed at ${endpoint}: ${response.status()} ${response.statusText()}`
      );
    }
  }

  getPoolSnapshot(): { available: number; inUse: number; maxSize: number } {
    return this.userPool.snapshot();
  }
}
