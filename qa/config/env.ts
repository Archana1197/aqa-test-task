export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function resolveBaseUrl(environmentName: 'local' | 'staging' | 'production'): string {
  const globalBaseUrl = process.env.BASE_URL?.trim();
  if (globalBaseUrl) {
    return globalBaseUrl;
  }

  const envSpecificName = `${environmentName.toUpperCase()}_BASE_URL`;
  const envSpecificBaseUrl = process.env[envSpecificName]?.trim();
  if (envSpecificBaseUrl) {
    return envSpecificBaseUrl;
  }

  if (environmentName === 'local') {
    // Local fallback avoids hard failure when env files are not loaded in developer machines.
    return 'http://localhost:8080';
  }

  return requiredEnv(envSpecificName);
}
