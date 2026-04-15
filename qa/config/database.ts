import { RuntimeConfig } from './runtime';
import { DatabaseConfig } from './types';

export function getDatabaseConfig(): DatabaseConfig {
  return RuntimeConfig.environment.database;
}
