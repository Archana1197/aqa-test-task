export type EnvironmentName = 'local' | 'staging' | 'production';

export interface PlaywrightExecutionConfig {
  workers: number;
  retries: number;
  fullyParallel: boolean;
  timeoutMs: number;
  actionTimeoutMs: number;
}

export interface MonitoringConfig {
  healthEndpoint: string;
  metricsOutputPath: string;
  benchmarkThresholdMs: number;
  enterpriseWebhookUrl?: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  seedUserSql: string;
  cleanupUserSql: string;
}

export interface EnvironmentConfig {
  name: EnvironmentName;
  baseUrl: string;
  playwright: PlaywrightExecutionConfig;
  monitoring: MonitoringConfig;
  database: DatabaseConfig;
}

export interface FeatureFlags {
  enableDatabaseSeeding: boolean;
  enableParallelExecution: boolean;
  enableResourcePooling: boolean;
  enableDiagnostics: boolean;
  enableMetrics: boolean;
}
