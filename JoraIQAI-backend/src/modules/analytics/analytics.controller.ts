import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('analytics/overview')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get overall analytics for authenticated teacher' })
  async getOverview(@CurrentUser('id') teacherId: string) {
    return this.analyticsService.getTeacherOverview(teacherId);
  }

  @Get('quizzes/:id/analytics')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get detailed performance analytics for a specific quiz (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires TEACHER role & quiz ownership' })
  async getQuizAnalytics(@Param('id') quizId: string, @CurrentUser('id') teacherId: string) {
    return this.analyticsService.getQuizAnalytics(quizId, teacherId);
  }
}
