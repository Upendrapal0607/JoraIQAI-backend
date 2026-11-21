import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeacherOverview(teacherId: string) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { teacherId },
      include: {
        assignments: true,
        attempts: true,
      },
    });

    const totalQuizzes = quizzes.length;
    let totalAssigned = 0;
    let totalCompleted = 0;
    let accuracySum = 0;

    for (const q of quizzes) {
      totalAssigned += q.assignments.length;
      totalCompleted += q.attempts.length;
      accuracySum += q.attempts.reduce((sum, a) => sum + a.accuracy, 0);
    }

    const overallAccuracy =
      totalCompleted > 0 ? Math.round((accuracySum / totalCompleted) * 10) / 10 : 0;
    const completionRate =
      totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 1000) / 10 : 0;

    return {
      totalQuizzes,
      totalAssigned,
      totalCompleted,
      completionRate,
      overallAccuracy,
    };
  }

  async getQuizAnalytics(quizId: string, teacherId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: true,
            attemptAnswers: true,
          },
        },
        assignments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            attempt: {
              select: {
                id: true,
                score: true,
                totalQuestions: true,
                correctAnswers: true,
                incorrectAnswers: true,
                accuracy: true,
                submittedAt: true,
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException('You do not own this quiz');
    }

    const totalAssigned = quiz.assignments.length;
    const completedAssignments = quiz.assignments.filter((a) => a.attempt !== null);
    const totalCompleted = completedAssignments.length;

    const averageAccuracy =
      totalCompleted > 0
        ? Math.round(
            (completedAssignments.reduce((sum, a) => sum + (a.attempt?.accuracy || 0), 0) /
              totalCompleted) *
              10,
          ) / 10
        : 0;

    const studentPerformance = quiz.assignments.map((a) => ({
      studentId: a.student.id,
      studentName: a.student.name,
      studentEmail: a.student.email,
      assignedAt: a.assignedAt,
      status: a.status,
      completedAt: a.completedAt,
      attempt: a.attempt
        ? {
            id: a.attempt.id,
            score: a.attempt.score,
            totalQuestions: a.attempt.totalQuestions,
            correctAnswers: a.attempt.correctAnswers,
            incorrectAnswers: a.attempt.incorrectAnswers,
            accuracy: a.attempt.accuracy,
            submittedAt: a.attempt.submittedAt,
          }
        : null,
    }));

    // Question-wise accuracy breakdown
    const questionAnalytics = quiz.questions.map((q) => {
      const totalAnswers = q.attemptAnswers.length;
      const correctAnswers = q.attemptAnswers.filter((ans) => ans.isCorrect).length;
      const questionAccuracy =
        totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 1000) / 10 : 0;

      return {
        questionId: q.id,
        questionText: q.text,
        order: q.order,
        totalAttempts: totalAnswers,
        correctCount: correctAnswers,
        accuracy: questionAccuracy,
      };
    });

    return {
      quizId: quiz.id,
      quizTitle: quiz.title,
      description: quiz.description,
      createdAt: quiz.createdAt,
      totalAssigned,
      totalCompleted,
      completionRate:
        totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 1000) / 10 : 0,
      averageAccuracy,
      studentPerformance,
      questionAnalytics,
    };
  }
}
