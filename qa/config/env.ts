export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function envString(name: string, defaultValue?: string): string {
  const value = process.env[name]?.trim();
  if (value && value.length > 0) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  return requiredEnv(name);
}

export function envNumber(name: string, defaultValue: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return defaultValue;
  }

  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a number. Received: ${raw}`);
  }

  return parsed;
}

export function envBoolean(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) {
    return defaultValue;
  }
  return raw === 'true';
}

export function envOptional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
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
