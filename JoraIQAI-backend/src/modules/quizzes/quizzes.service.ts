import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async createQuiz(teacherId: string, dto: CreateQuizDto) {
    // Validate each question has at least 1 correct option (exactly 1 recommended)
    for (let i = 0; i < dto.questions.length; i++) {
      const q = dto.questions[i];
      const correctCount = q.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        throw new BadRequestException(
          `Question #${i + 1} ("${q.text.slice(0, 30)}...") must have exactly one correct answer marked. Found: ${correctCount}`,
        );
      }
    }

    const quiz = await this.prisma.$transaction(async (tx) => {
      const createdQuiz = await tx.quiz.create({
        data: {
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          teacherId,
        },
      });

      for (let qIdx = 0; qIdx < dto.questions.length; qIdx++) {
        const qDto = dto.questions[qIdx];
        const question = await tx.question.create({
          data: {
            quizId: createdQuiz.id,
            text: qDto.text.trim(),
            order: qIdx,
          },
        });

        for (let oIdx = 0; oIdx < qDto.options.length; oIdx++) {
          const oDto = qDto.options[oIdx];
          await tx.option.create({
            data: {
              questionId: question.id,
              text: oDto.text.trim(),
              isCorrect: oDto.isCorrect,
              order: oIdx,
            },
          });
        }
      }

      return createdQuiz;
    });

    return this.getQuizDetailsForTeacher(quiz.id, teacherId);
  }

  async getTeacherQuizzes(teacherId: string) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: {
            questions: true,
            assignments: true,
            attempts: true,
          },
        },
        attempts: {
          select: {
            accuracy: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return quizzes.map((quiz) => {
      const completedCount = quiz.attempts.length;
      const averageAccuracy =
        completedCount > 0
          ? Math.round(
              (quiz.attempts.reduce((sum, a) => sum + a.accuracy, 0) / completedCount) * 10,
            ) / 10
          : 0;

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        createdAt: quiz.createdAt,
        totalQuestions: quiz._count.questions,
        totalAssigned: quiz._count.assignments,
        totalCompleted: completedCount,
        averageAccuracy,
      };
    });
  }

  async getQuizDetailsForTeacher(quizId: string, teacherId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
        assignments: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
            attempt: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this quiz');
    }

    return quiz;
  }

  async getQuizForStudent(quizId: string, studentId: string) {
    // Check if student has assignment
    const assignment = await this.prisma.quizAssignment.findUnique({
      where: {
        quizId_studentId: {
          quizId,
          studentId,
        },
      },
      include: {
        attempt: true,
      },
    });

    if (!assignment) {
      throw new ForbiddenException('You have not been assigned to this quiz');
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
              // SECURITY: Exclude isCorrect so answer keys are NEVER exposed to student before submit!
              select: {
                id: true,
                text: true,
                order: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
      },
      assignmentId: assignment.id,
      status: assignment.status,
      attempt: assignment.attempt,
    };
  }

  async deleteQuiz(quizId: string, teacherId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException('You cannot delete a quiz you do not own');
    }

    await this.prisma.quiz.delete({
      where: { id: quizId },
    });

    return { message: 'Quiz deleted successfully', id: quizId };
  }
}
