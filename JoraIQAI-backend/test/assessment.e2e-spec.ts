import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('JoraIQ.AI Assessment Automated Test Suite (Mandatory Requirements)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let teacherToken: string;
  let student1Token: string;
  let student2Token: string;
  let student3Token: string;
  let student4Token: string;

  let teacherId: string;
  let student1Id: string;
  let student2Id: string;
  let student3Id: string;
  let student4Id: string;

  let testQuizId: string;
  let testAssignmentId: string;
  let unassignedQuizId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // 1. Login Teacher
    const teacherLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'teacher@joraiq.ai', password: 'password123' });
    teacherToken = teacherLogin.body.accessToken;
    teacherId = teacherLogin.body.user.id;

    // 2. Login Students
    const s1Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student1@joraiq.ai', password: 'password123' });
    student1Token = s1Login.body.accessToken;
    student1Id = s1Login.body.user.id;

    const s2Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student2@joraiq.ai', password: 'password123' });
    student2Token = s2Login.body.accessToken;
    student2Id = s2Login.body.user.id;

    const s3Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student3@joraiq.ai', password: 'password123' });
    student3Token = s3Login.body.accessToken;
    student3Id = s3Login.body.user.id;

    const s4Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student4@joraiq.ai', password: 'password123' });
    student4Token = s4Login.body.accessToken;
    student4Id = s4Login.body.user.id;

    // 3. Create a fresh test quiz for submission tests
    const quizRes = await request(app.getHttpServer())
      .post('/quizzes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'E2E Automated Test Quiz',
        description: 'Testing submission, duplicate rejection, and scoring',
        questions: [
          {
            text: 'What is 2 + 2 in base 10?',
            options: [
              { text: '3', isCorrect: false },
              { text: '4', isCorrect: true },
              { text: '5', isCorrect: false },
              { text: '6', isCorrect: false },
            ],
          },
          {
            text: 'Which planet is known as the Red Planet?',
            options: [
              { text: 'Venus', isCorrect: false },
              { text: 'Mars', isCorrect: true },
              { text: 'Jupiter', isCorrect: false },
              { text: 'Saturn', isCorrect: false },
            ],
          },
        ],
      });
    testQuizId = quizRes.body.id;

    // 4. Assign testQuiz to student4 (who has no prior attempts)
    await request(app.getHttpServer())
      .post(`/quizzes/${testQuizId}/assign`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ studentIds: [student4Id] });

    const assignments = await prisma.quizAssignment.findMany({
      where: { quizId: testQuizId, studentId: student4Id },
    });
    testAssignmentId = assignments[0].id;

    // 5. Create an unassigned quiz (assigned to nobody)
    const unassignedQuizRes = await request(app.getHttpServer())
      .post('/quizzes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Unassigned Private Quiz',
        description: 'No students assigned',
        questions: [
          {
            text: 'Is this quiz unassigned?',
            options: [
              { text: 'Yes', isCorrect: true },
              { text: 'No', isCorrect: false },
              { text: 'Maybe', isCorrect: false },
              { text: 'Unknown', isCorrect: false },
            ],
          },
        ],
      });
    unassignedQuizId = unassignedQuizRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // -------------------------------------------------------------
  // Test 1: Successful quiz submission and score calculation
  // -------------------------------------------------------------
  it('Requirement 1: Should successfully submit quiz and calculate score server-side', async () => {
    // Student 4 takes quiz questions (security check: isCorrect must NOT be exposed)
    const takeRes = await request(app.getHttpServer())
      .get(`/quizzes/${testQuizId}/take`)
      .set('Authorization', `Bearer ${student4Token}`)
      .expect(200);

    expect(takeRes.body.quiz.questions).toBeDefined();
    expect(takeRes.body.quiz.questions.length).toBe(2);

    // Verify security: options should NOT contain isCorrect field!
    const firstOption = takeRes.body.quiz.questions[0].options[0];
    expect(firstOption.isCorrect).toBeUndefined();

    // Fetch question IDs and correct option IDs from DB for testing answer submission
    const q1 = await prisma.question.findFirst({
      where: { quizId: testQuizId, order: 0 },
      include: { options: true },
    });
    const q2 = await prisma.question.findFirst({
      where: { quizId: testQuizId, order: 1 },
      include: { options: true },
    });

    const q1Correct = q1.options.find((o) => o.isCorrect);
    const q2Wrong = q2.options.find((o) => !o.isCorrect);

    // Submit: Question 1 correct, Question 2 incorrect (1/2 = 50% accuracy)
    const submitRes = await request(app.getHttpServer())
      .post(`/quizzes/${testQuizId}/submit`)
      .set('Authorization', `Bearer ${student4Token}`)
      .send({
        assignmentId: testAssignmentId,
        answers: [
          { questionId: q1.id, selectedOptionId: q1Correct.id },
          { questionId: q2.id, selectedOptionId: q2Wrong.id },
        ],
      })
      .expect(201);

    expect(submitRes.body.totalQuestions).toBe(2);
    expect(submitRes.body.correctAnswers).toBe(1);
    expect(submitRes.body.incorrectAnswers).toBe(1);
    expect(submitRes.body.score).toBe(1);
    expect(submitRes.body.accuracy).toBe(50.0);
    expect(submitRes.body.breakdown).toBeDefined();
    expect(submitRes.body.breakdown.length).toBe(2);
  });

  // -------------------------------------------------------------
  // Test 2: Rejection of a second submission for the same assignment
  // -------------------------------------------------------------
  it('Requirement 2: Should reject a second submission for the same assignment with 409 Conflict', async () => {
    const q1 = await prisma.question.findFirst({
      where: { quizId: testQuizId, order: 0 },
      include: { options: true },
    });

    const res = await request(app.getHttpServer())
      .post(`/quizzes/${testQuizId}/submit`)
      .set('Authorization', `Bearer ${student4Token}`)
      .send({
        assignmentId: testAssignmentId,
        answers: [{ questionId: q1.id, selectedOptionId: q1.options[0].id }],
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already been submitted');
  });

  // -------------------------------------------------------------
  // Test 3: Rejection when a student attempts an unassigned quiz
  // -------------------------------------------------------------
  it('Requirement 3: Should reject when a student attempts to take an unassigned quiz with 403 Forbidden', async () => {
    // Student 4 was never assigned to unassignedQuizId
    const res = await request(app.getHttpServer())
      .get(`/quizzes/${unassignedQuizId}/take`)
      .set('Authorization', `Bearer ${student4Token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('not been assigned');
  });

  // -------------------------------------------------------------
  // Test 4: Rejection when a student attempts a teacher-only operation
  // -------------------------------------------------------------
  it('Requirement 4: Should reject when a student attempts a teacher-only operation with 403 Forbidden', async () => {
    // 4a. Student attempts to create a quiz
    const createQuizRes = await request(app.getHttpServer())
      .post('/quizzes')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        title: 'Hacked Quiz by Student',
        questions: [
          {
            text: 'Should this fail?',
            options: [
              { text: 'Yes', isCorrect: true },
              { text: 'No', isCorrect: false },
            ],
          },
        ],
      });

    expect(createQuizRes.status).toBe(403);
    expect(createQuizRes.body.message).toContain('Access denied: requires TEACHER role');

    // 4b. Student attempts to fetch student list
    const getStudentsRes = await request(app.getHttpServer())
      .get('/users/students')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(getStudentsRes.status).toBe(403);

    // 4c. Student attempts to access teacher analytics
    const getAnalyticsRes = await request(app.getHttpServer())
      .get('/analytics/overview')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(getAnalyticsRes.status).toBe(403);
  });

  // -------------------------------------------------------------
  // Test 5: Correct leaderboard ranking for students with equal scores
  // -------------------------------------------------------------
  it('Requirement 5: Should assign equal ranks to students with equal scores (Standard Competition Ranking)', async () => {
    // Find Quiz 1 (seeded with Ada Lovelace 100%, Grace Hopper 100%, Claude Shannon 60%)
    const quiz1 = await prisma.quiz.findFirst({
      where: { title: { contains: 'Artificial Intelligence' } },
    });

    expect(quiz1).toBeDefined();

    const leaderboardRes = await request(app.getHttpServer())
      .get(`/quizzes/${quiz1.id}/leaderboard`)
      .set('Authorization', `Bearer ${student1Token}`)
      .expect(200);

    const { leaderboard } = leaderboardRes.body;
    expect(leaderboard).toBeDefined();
    expect(leaderboard.length).toBeGreaterThanOrEqual(3);

    // Entry 0: 100% -> Rank 1
    // Entry 1: 100% -> Rank 1 (Equal score = Equal rank!)
    // Entry 2: 60%  -> Rank 3 (Standard competition rank 1, 1, 3)
    const first = leaderboard[0];
    const second = leaderboard[1];
    const third = leaderboard[2];

    expect(first.accuracy).toBe(100.0);
    expect(first.rank).toBe(1);

    expect(second.accuracy).toBe(100.0);
    expect(second.rank).toBe(1); // Equal rank confirmed!

    expect(third.accuracy).toBe(60.0);
    expect(third.rank).toBe(3); // Rank 3 confirmed!
  });
});
