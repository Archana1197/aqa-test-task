export interface UserCredentials {
  username: string;
  email: string;
  password: string;
}

export interface TaskData {
  title: string;
  description: string;
}

export interface ProjectData {
  title: string;
  description: string;
}

const generateTimestamp = (): string => Date.now().toString();

export const TestData = {
  createDefaultUser(): UserCredentials {
    return {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'TestPassword123!',
    };
  },

  createInvalidUser(): UserCredentials {
    return {
      username: 'invaliduser',
      email: 'invalid@example.com',
      password: 'wrongpassword',
    };
  },

  createUniqueUser(): UserCredentials {
    const timestamp = generateTimestamp();
    return {
      username: `e2e_user_${timestamp}`,
      email: `e2e_user_${timestamp}@example.com`,
      password: 'TestPassword123!',
    };
  },

  createTask(titlePrefix: string = 'QA Test Task'): TaskData {
    const timestamp = generateTimestamp();
    return {
      title: `${titlePrefix} ${timestamp}`,
      description: 'Creating a test task for QA automation',
    };
  },

  createUpdatedTask(titlePrefix: string = 'Updated Task Title'): TaskData {
    const timestamp = generateTimestamp();
    return {
      title: `${titlePrefix} ${timestamp}`,
      description: 'Updated description',
    };
  },

  createProject(titlePrefix: string = 'Test Project'): ProjectData {
    const timestamp = generateTimestamp();
    return {
      title: `${titlePrefix} ${timestamp}`,
      description: 'A project created for testing',
    };
  },

  generateEmail(prefix: string = 'testuser'): string {
    return `${prefix}_${generateTimestamp()}@example.com`;
  },

  generateUsername(prefix: string = 'testuser'): string {
    return `${prefix}_${generateTimestamp()}`;
  },
};
