import { FeatureFlags } from './types';
import { envBoolean } from './env';

export const featureFlags: FeatureFlags = {
  enableDatabaseSeeding: envBoolean('FEATURE_DB_SEEDING', true),
  enableParallelExecution: envBoolean('FEATURE_PARALLEL_EXECUTION', true),
  enableResourcePooling: envBoolean('FEATURE_RESOURCE_POOLING', true),
  enableDiagnostics: envBoolean('FEATURE_DIAGNOSTICS', true),
  enableMetrics: envBoolean('FEATURE_METRICS', true),
};
