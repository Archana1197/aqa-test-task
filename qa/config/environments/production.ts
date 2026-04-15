import { EnvironmentConfig } from '../types';
import { resolveBaseUrl } from '../env';

export const productionEnvironment: EnvironmentConfig = {
  name: 'production',
  baseUrl: resolveBaseUrl('production'),
  playwright: {
    workers: Number(process.env.PW_WORKERS ?? '5'),
    retries: Number(process.env.PW_RETRIES ?? '2'),
    fullyParallel: true,
    timeoutMs: Number(process.env.PW_TIMEOUT_MS ?? '120000'),
    actionTimeoutMs: Number(process.env.PW_ACTION_TIMEOUT_MS ?? '25000'),
  },
  monitoring: {
    healthEndpoint: process.env.HEALTH_ENDPOINT ?? '/api/v1/info',
    metricsOutputPath: process.env.METRICS_OUTPUT_PATH ?? 'test-results/enterprise-metrics.json',
    benchmarkThresholdMs: Number(process.env.BENCHMARK_THRESHOLD_MS ?? '7000'),
    enterpriseWebhookUrl: process.env.ENTERPRISE_METRICS_WEBHOOK,
  },
  database: {
    host: process.env.DB_HOST ?? 'prod-db.internal',
    port: Number(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USER ?? 'vikunja',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'vikunja',
    connectionLimit: Number(process.env.DB_POOL_LIMIT ?? '30'),
    seedUserSql:
      process.env.DB_SEED_USER_SQL ??
      'INSERT INTO users (username, email, password, created, updated) VALUES (?, ?, ?, NOW(), NOW())',
    cleanupUserSql: process.env.DB_CLEANUP_USER_SQL ?? 'DELETE FROM users WHERE email = ?',
  },
};
