import { EnvironmentConfig } from '../types';
import { envNumber, envOptional, envString, resolveBaseUrl } from '../env';

export const localEnvironment: EnvironmentConfig = {
  name: 'local',
  baseUrl: resolveBaseUrl('local'),
  playwright: {
    workers: envNumber('PW_WORKERS', 3),
    retries: envNumber('PW_RETRIES', 2),
    fullyParallel: true,
    timeoutMs: envNumber('PW_TIMEOUT_MS', 180000),
    actionTimeoutMs: envNumber('PW_ACTION_TIMEOUT_MS', 20000),
  },
  monitoring: {
    healthEndpoint: envString('HEALTH_ENDPOINT', '/api/v1/info'),
    metricsOutputPath: envString('METRICS_OUTPUT_PATH', 'test-results/enterprise-metrics.json'),
    benchmarkThresholdMs: envNumber('BENCHMARK_THRESHOLD_MS', 5000),
    enterpriseWebhookUrl: envOptional('ENTERPRISE_METRICS_WEBHOOK'),
  },
  database: {
    host: envString('DB_HOST', '127.0.0.1'),
    port: envNumber('DB_PORT', 3306),
    user: envString('DB_USER', 'vikunja'),
    password: envString('DB_PASSWORD', 'vicunja_password'),
    database: envString('DB_NAME', 'vikunja'),
    connectionLimit: envNumber('DB_POOL_LIMIT', 10),
    seedUserSql:
      envString(
        'DB_SEED_USER_SQL',
      'INSERT INTO users (username, email, password, created, updated) VALUES (?, ?, ?, NOW(), NOW())',
      ),
    cleanupUserSql: envString('DB_CLEANUP_USER_SQL', 'DELETE FROM users WHERE email = ?'),
  },
};
