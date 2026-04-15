/**
 * Page configuration constants
 * Centralizes all timeouts and configuration values following DRY principle
 */
export const PageConfig = {
  /** Default timeout for element operations (ms) */
  DEFAULT_TIMEOUT: 15000,
  
  /** Short timeout for quick operations (ms) */
  SHORT_TIMEOUT: 5000,
  
  /** Long timeout for slow operations (ms) */
  LONG_TIMEOUT: 30000,
  
  /** Default navigation timeout (ms) */
  NAVIGATION_TIMEOUT: 15000,
} as const;

/**
 * Test data constants
 * Centralizes test-related configuration values
 */
export const TestConstants = {
  /** Default project ID for inbox/default project */
  DEFAULT_PROJECT_ID: 1,
} as const;

/**
 * Task page specific selectors
 * Follows Open/Closed Principle - easy to extend without modifying code
 */
export const TaskSelectors = {
  // Task links
  TASK_LINK: 'a[href*="/tasks/"]',
  
  // Role-based selectors
  TASK_INPUT_LABEL: 'Add a task…',
  ADD_BUTTON_LABEL: 'Add',
  DELETE_BUTTON_LABEL: 'Delete',
  CONFIRM_DELETE_BUTTON_LABEL: 'Do it!',
  CHECKBOX_LABEL: 'Checkbox',
  
  // Routes
  OVERVIEW_ROUTE: '/',
} as const;

/**
 * Authentication page selectors
 */
export const AuthSelectors = {
  // Login
  LOGIN_EMAIL_LABEL: 'Username Or Email Address',
  LOGIN_PASSWORD_LABEL: 'Password',
  LOGIN_BUTTON_LABEL: 'LOGIN',
  LOGIN_ROUTE: '/login',
  
  // Register
  REGISTER_USERNAME_LABEL: 'Username',
  REGISTER_EMAIL_LABEL: 'Email address',
  REGISTER_PASSWORD_LABEL: 'Password',
  REGISTER_BUTTON_LABEL: 'CREATE ACCOUNT',
  REGISTER_ROUTE: '/register',
} as const;
