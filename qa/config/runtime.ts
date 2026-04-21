import { featureFlags } from './features';
import { envString } from './env';
import { EnvironmentConfig, EnvironmentName } from './types';

function getEnvironmentName(): EnvironmentName {
  const raw = envString('TEST_ENV', 'local').toLowerCase();
  if (raw === 'staging' || raw === 'production' || raw === 'local') {
    return raw;
  }
  return 'local';
}

function loadEnvironmentConfig(name: EnvironmentName): EnvironmentConfig {
  if (name === 'staging') {
    return require('./environments/staging').stagingEnvironment as EnvironmentConfig;
  }
  if (name === 'production') {
    return require('./environments/production').productionEnvironment as EnvironmentConfig;
  }
  return require('./environments/local').localEnvironment as EnvironmentConfig;
}

const environmentName = getEnvironmentName();
const environment = loadEnvironmentConfig(environmentName);

export const RuntimeConfig = {
  environmentName,
  environment,
  features: featureFlags,
};
