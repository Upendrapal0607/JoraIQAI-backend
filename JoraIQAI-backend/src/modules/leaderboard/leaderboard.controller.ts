import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Leaderboard')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('quizzes/:id/leaderboard')
  @ApiOperation({
    summary:
      'Get quiz leaderboard ranked by accuracy (Accessible only to assigned students and quiz teacher)',
  })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User not assigned to quiz or not the owner teacher',
  })
  async getQuizLeaderboard(
    @Param('id') quizId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.leaderboardService.getQuizLeaderboard(quizId, userId, userRole);
  }
}
