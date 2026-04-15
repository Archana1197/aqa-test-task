import { FeatureFlags } from './types';

function envFlag(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
}

export const featureFlags: FeatureFlags = {
  enableDatabaseSeeding: envFlag('FEATURE_DB_SEEDING', true),
  enableParallelExecution: envFlag('FEATURE_PARALLEL_EXECUTION', true),
  enableResourcePooling: envFlag('FEATURE_RESOURCE_POOLING', true),
  enableDiagnostics: envFlag('FEATURE_DIAGNOSTICS', true),
  enableMetrics: envFlag('FEATURE_METRICS', true),
};
