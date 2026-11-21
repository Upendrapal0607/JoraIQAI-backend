import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Quizzes')
@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Create a new quiz with MCQ questions (Teacher only)' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires TEACHER role' })
  async createQuiz(@CurrentUser('id') teacherId: string, @Body() dto: CreateQuizDto) {
    return this.quizzesService.createQuiz(teacherId, dto);
  }

  @Get('teacher')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get all quizzes created by authenticated teacher' })
  async getTeacherQuizzes(@CurrentUser('id') teacherId: string) {
    return this.quizzesService.getTeacherQuizzes(teacherId);
  }

  @Get(':id/teacher')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get detailed quiz information including questions & assignments (Teacher only)' })
  async getQuizForTeacher(@Param('id') quizId: string, @CurrentUser('id') teacherId: string) {
    return this.quizzesService.getQuizDetailsForTeacher(quizId, teacherId);
  }

  @Get(':id/take')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get assigned quiz questions for student attempt (Answer keys stripped for security)' })
  async getQuizForStudent(@Param('id') quizId: string, @CurrentUser('id') studentId: string) {
    return this.quizzesService.getQuizForStudent(quizId, studentId);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete quiz (Teacher only)' })
  async deleteQuiz(@Param('id') quizId: string, @CurrentUser('id') teacherId: string) {
    return this.quizzesService.deleteQuiz(quizId, teacherId);
  }
}
