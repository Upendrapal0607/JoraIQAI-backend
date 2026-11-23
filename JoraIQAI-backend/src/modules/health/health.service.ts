import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime: {
    seconds: number;
    formatted: string;
  };
  database: {
    status: 'connected' | 'disconnected';
    latencyMs?: number;
    error?: string;
  };
  memory: {
    heapUsedMB: number;
    rssMB: number;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  private formatUptime(seconds: number): string {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  }

  async check(): Promise<HealthCheckResult> {
    const mem = process.memoryUsage();
    const uptimeSeconds = Math.floor(process.uptime());

    let dbStatus: 'connected' | 'disconnected' = 'connected';
    let dbLatencyMs: number | undefined = undefined;
    let dbError: string | undefined = undefined;

    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch (err: any) {
      dbStatus = 'disconnected';
      dbError = err.message || 'Database connection error';
      this.logger.error('Health check failed to query database:', err);
    }

    const overallStatus: 'ok' | 'degraded' = dbStatus === 'connected' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      service: 'JoraIQ.AI Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        formatted: this.formatUptime(uptimeSeconds),
      },
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        error: dbError,
      },
      memory: {
        heapUsedMB: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        rssMB: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      },
    };
  }

  ping() {
    return {
      status: 'ok',
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
