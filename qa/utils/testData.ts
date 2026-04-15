/**
 * Test data models and builders
 * Follows Builder Pattern for flexible test data creation
 */

/**
 * User credentials interface
 */
export interface UserCredentials {
  username: string;
  email: string;
  password: string;
}

/**
 * Task data interface
 */
export interface TaskData {
  title: string;
  description: string;
}

/**
 * Project data interface
 */
export interface ProjectData {
  title: string;
  description: string;
}

/**
 * Test Data Builder
 * Provides fluent interface for creating test data
 * Follows Builder Pattern and Singleton Pattern
 */
class TestDataBuilder {
  private static instance: TestDataBuilder;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): TestDataBuilder {
    if (!TestDataBuilder.instance) {
      TestDataBuilder.instance = new TestDataBuilder();
    }
    return TestDataBuilder.instance;
  }

  /**
   * Generate unique timestamp suffix
   */
  private generateTimestamp(): string {
    return Date.now().toString();
  }

  /**
   * Create user credentials with default values
   */
  createDefaultUser(): UserCredentials {
    return {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'TestPassword123!',
    };
  }

  /**
   * Create invalid user credentials for negative testing
   */
  createInvalidUser(): UserCredentials {
    return {
      username: 'invaliduser',
      email: 'invalid@example.com',
      password: 'wrongpassword',
    };
  }

  /**
   * Create user with unique credentials
   */
  createUniqueUser(): UserCredentials {
    const timestamp = this.generateTimestamp();
    return {
      username: `e2e_user_${timestamp}`,
      email: `e2e_user_${timestamp}@example.com`,
      password: 'TestPassword123!',
    };
  }

  /**
   * Create task data with unique title
   */
  createTask(titlePrefix: string = 'QA Test Task'): TaskData {
    const timestamp = this.generateTimestamp();
    return {
      title: `${titlePrefix} ${timestamp}`,
      description: 'Creating a test task for QA automation',
    };
  }

  /**
   * Create updated task data
   */
  createUpdatedTask(titlePrefix: string = 'Updated Task Title'): TaskData {
    const timestamp = this.generateTimestamp();
    return {
      title: `${titlePrefix} ${timestamp}`,
      description: 'Updated description',
    };
  }

  /**
   * Create project data
   */
  createProject(titlePrefix: string = 'Test Project'): ProjectData {
    const timestamp = this.generateTimestamp();
    return {
      title: `${titlePrefix} ${timestamp}`,
      description: 'A project created for testing',
    };
  }

  /**
   * Generate random email
   */
  generateEmail(prefix: string = 'testuser'): string {
    return `${prefix}_${this.generateTimestamp()}@example.com`;
  }

  /**
   * Generate random username
   */
  generateUsername(prefix: string = 'testuser'): string {
    return `${prefix}_${this.generateTimestamp()}`;
  }
}

/**
 * Exported test data instance
 * Provides singleton access to test data generation methods
 */
export const TestData = TestDataBuilder.getInstance();
