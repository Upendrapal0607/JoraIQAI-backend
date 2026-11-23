import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from './health.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Comprehensive server and database health check' })
  @ApiResponse({ status: 200, description: 'Server and database are healthy' })
  @ApiResponse({ status: 503, description: 'Server or database is degraded/unhealthy' })
  async getHealth(@Res({ passthrough: true }) res: Response) {
    const result = await this.healthService.check();
    if (result.status === 'degraded' || result.status === 'error') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }

  @Public()
  @Get('ping')
  @ApiOperation({ summary: 'Lightweight server ping / liveness probe' })
  @ApiResponse({ status: 200, description: 'Server is reachable' })
  ping() {
    return this.healthService.ping();
  }
}
