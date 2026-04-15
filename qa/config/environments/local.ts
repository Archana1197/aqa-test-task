import { EnvironmentConfig } from '../types';
import { resolveBaseUrl } from '../env';

export const localEnvironment: EnvironmentConfig = {
  name: 'local',
  baseUrl: resolveBaseUrl('local'),
  playwright: {
    workers: Number(process.env.PW_WORKERS ?? '3'),
    retries: Number(process.env.PW_RETRIES ?? '2'),
    fullyParallel: true,
    timeoutMs: Number(process.env.PW_TIMEOUT_MS ?? '180000'),
    actionTimeoutMs: Number(process.env.PW_ACTION_TIMEOUT_MS ?? '20000'),
  },
  monitoring: {
    healthEndpoint: process.env.HEALTH_ENDPOINT ?? '/api/v1/info',
    metricsOutputPath: process.env.METRICS_OUTPUT_PATH ?? 'test-results/enterprise-metrics.json',
    benchmarkThresholdMs: Number(process.env.BENCHMARK_THRESHOLD_MS ?? '5000'),
    enterpriseWebhookUrl: process.env.ENTERPRISE_METRICS_WEBHOOK,
  },
  database: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USER ?? 'vikunja',
    password: process.env.DB_PASSWORD ?? 'vicunja_password',
    database: process.env.DB_NAME ?? 'vikunja',
    connectionLimit: Number(process.env.DB_POOL_LIMIT ?? '10'),
    seedUserSql:
      process.env.DB_SEED_USER_SQL ??
      'INSERT INTO users (username, email, password, created, updated) VALUES (?, ?, ?, NOW(), NOW())',
    cleanupUserSql: process.env.DB_CLEANUP_USER_SQL ?? 'DELETE FROM users WHERE email = ?',
  },
};
