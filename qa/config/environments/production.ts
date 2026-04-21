import { EnvironmentConfig } from '../types';
import { envNumber, envOptional, envString, resolveBaseUrl } from '../env';

export const productionEnvironment: EnvironmentConfig = {
  name: 'production',
  baseUrl: resolveBaseUrl('production'),
  playwright: {
    workers: envNumber('PW_WORKERS', 5),
    retries: envNumber('PW_RETRIES', 2),
    fullyParallel: true,
    timeoutMs: envNumber('PW_TIMEOUT_MS', 120000),
    actionTimeoutMs: envNumber('PW_ACTION_TIMEOUT_MS', 25000),
  },
  monitoring: {
    healthEndpoint: envString('HEALTH_ENDPOINT', '/api/v1/info'),
    metricsOutputPath: envString('METRICS_OUTPUT_PATH', 'test-results/enterprise-metrics.json'),
    benchmarkThresholdMs: envNumber('BENCHMARK_THRESHOLD_MS', 7000),
    enterpriseWebhookUrl: envOptional('ENTERPRISE_METRICS_WEBHOOK'),
  },
  database: {
    host: envString('DB_HOST', 'prod-db.internal'),
    port: envNumber('DB_PORT', 3306),
    user: envString('DB_USER', 'vikunja'),
    password: envString('DB_PASSWORD', ''),
    database: envString('DB_NAME', 'vikunja'),
    connectionLimit: envNumber('DB_POOL_LIMIT', 30),
    seedUserSql:
      envString(
        'DB_SEED_USER_SQL',
      'INSERT INTO users (username, email, password, created, updated) VALUES (?, ?, ?, NOW(), NOW())',
      ),
    cleanupUserSql: envString('DB_CLEANUP_USER_SQL', 'DELETE FROM users WHERE email = ?'),
  },
};
