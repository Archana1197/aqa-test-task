import fs from 'fs';
import path from 'path';
import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { RuntimeConfig } from '../config/runtime';
import { envBoolean, envNumber } from '../config/env';

interface TestMetric {
  id: string;
  title: string;
  status: TestResult['status'];
  durationMs: number;
  retries: number;
  error?: string;
}

interface HealthSample {
  timestamp: string;
  status: 'healthy' | 'unhealthy';
  statusCode?: number;
  responseTimeMs: number;
}

class EnterpriseReporter implements Reporter {
  private readonly startedAt = Date.now();
  private readonly metrics: TestMetric[] = [];
  private readonly healthSamples: HealthSample[] = [];
  private healthInterval: NodeJS.Timeout | null = null;

  onBegin(): void {
    const shouldSampleHealth = envBoolean('FEATURE_HEALTH_SAMPLING', true);
    if (!shouldSampleHealth) {
      return;
    }

    const intervalMs = envNumber('HEALTH_SAMPLE_INTERVAL_MS', 15000);
    this.healthInterval = setInterval(() => {
      void this.captureHealthSample();
    }, intervalMs);
  }

  private async captureHealthSample(): Promise<void> {
    const endpoint = RuntimeConfig.environment.monitoring.healthEndpoint;
    const targetUrl = `${RuntimeConfig.environment.baseUrl}${endpoint}`;
    const startedAt = Date.now();

    try {
      const response = await fetch(targetUrl);
      this.healthSamples.push({
        timestamp: new Date().toISOString(),
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        responseTimeMs: Date.now() - startedAt,
      });
    } catch {
      this.healthSamples.push({
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        responseTimeMs: Date.now() - startedAt,
      });
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.metrics.push({
      id: test.id,
      title: test.title,
      status: result.status,
      durationMs: result.duration,
      retries: result.retry,
      error: result.error?.message,
    });
  }

  async onEnd(result: FullResult): Promise<void> {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }

    const durationMs = Date.now() - this.startedAt;
    const benchmarkThresholdMs = RuntimeConfig.environment.monitoring.benchmarkThresholdMs;
    const slowTests = this.metrics.filter(m => m.durationMs > benchmarkThresholdMs).length;
    const failedTests = this.metrics.filter(m => m.status === 'failed' || m.status === 'timedOut');

    const payload = {
      environment: RuntimeConfig.environmentName,
      status: result.status,
      durationMs,
      totals: {
        tests: this.metrics.length,
        passed: this.metrics.filter(m => m.status === 'passed').length,
        failed: this.metrics.filter(m => m.status === 'failed').length,
        timedOut: this.metrics.filter(m => m.status === 'timedOut').length,
        slowTests,
      },
      health: {
        samplesCollected: this.healthSamples.length,
        unhealthySamples: this.healthSamples.filter(h => h.status === 'unhealthy').length,
        averageResponseMs: this.healthSamples.length === 0
          ? 0
          : Math.round(this.healthSamples.reduce((sum, sample) => sum + sample.responseTimeMs, 0) / this.healthSamples.length),
      },
      failedTests,
      tests: this.metrics,
      healthSamples: this.healthSamples,
      generatedAt: new Date().toISOString(),
    };

    const metricsPath = RuntimeConfig.environment.monitoring.metricsOutputPath;
    fs.mkdirSync(path.dirname(metricsPath), { recursive: true });
    fs.writeFileSync(metricsPath, JSON.stringify(payload, null, 2), 'utf-8');

    const webhook = RuntimeConfig.environment.monitoring.enterpriseWebhookUrl;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        // Best effort external integration, do not fail the run.
      }
    }
  }
}

export default EnterpriseReporter;
