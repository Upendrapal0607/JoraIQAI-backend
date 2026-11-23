import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import * as bcrypt from 'bcryptjs';

describe('JoraIQ.AI Assessment Automated Test Suite (Mandatory Requirements)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

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
  let tiedQuizId: string;

  const testSuffix = Date.now();

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
    await app.listen(0);

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create or ensure test users directly in DB
    const teacher = await prisma.user.create({
      data: {
        email: `test_teacher_${testSuffix}@assessment.test`,
        password: hashedPassword,
        name: 'Dr. Test Teacher',
        role: 'TEACHER',
      },
    });
    teacherId = teacher.id;
    teacherToken = jwtService.sign({ sub: teacher.id, email: teacher.email, role: 'TEACHER' });

    const s1 = await prisma.user.create({
      data: {
        email: `test_s1_${testSuffix}@assessment.test`,
        password: hashedPassword,
        name: 'Test Student 1',
        role: 'STUDENT',
      },
    });
    student1Id = s1.id;
    student1Token = jwtService.sign({ sub: s1.id, email: s1.email, role: 'STUDENT' });

    const s2 = await prisma.user.create({
      data: {
        email: `test_s2_${testSuffix}@assessment.test`,
        password: hashedPassword,
        name: 'Test Student 2',
        role: 'STUDENT',
      },
    });
    student2Id = s2.id;
    student2Token = jwtService.sign({ sub: s2.id, email: s2.email, role: 'STUDENT' });

    const s3 = await prisma.user.create({
      data: {
        email: `test_s3_${testSuffix}@assessment.test`,
        password: hashedPassword,
        name: 'Test Student 3',
        role: 'STUDENT',
      },
    });
    student3Id = s3.id;
    student3Token = jwtService.sign({ sub: s3.id, email: s3.email, role: 'STUDENT' });

    const s4 = await prisma.user.create({
      data: {
        email: `test_s4_${testSuffix}@assessment.test`,
        password: hashedPassword,
        name: 'Test Student 4',
        role: 'STUDENT',
      },
    });
    student4Id = s4.id;
    student4Token = jwtService.sign({ sub: s4.id, email: s4.email, role: 'STUDENT' });

    // 2. Create a fresh test quiz for submission tests
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

    // 3. Assign testQuiz to student4
    await request(app.getHttpServer())
      .post(`/quizzes/${testQuizId}/assign`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ studentIds: [student4Id] });

    const assignments = await prisma.quizAssignment.findMany({
      where: { quizId: testQuizId, studentId: student4Id },
    });
    testAssignmentId = assignments[0].id;

    // 4. Create an unassigned quiz
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
            ],
          },
        ],
      });
    unassignedQuizId = unassignedQuizRes.body.id;

    // 5. Create tied quiz for Test 5
    const tiedQuiz = await prisma.quiz.create({
      data: {
        title: 'Tied Competition Ranking Quiz',
        description: 'Testing tied leaderboard ranks',
        teacherId: teacherId,
        questions: {
          create: [
            {
              text: 'Question 1',
              order: 0,
              options: {
                create: [
                  { text: 'A', isCorrect: true },
                  { text: 'B', isCorrect: false },
                ],
              },
            },
            {
              text: 'Question 2',
              order: 1,
              options: {
                create: [
                  { text: 'C', isCorrect: true },
                  { text: 'D', isCorrect: false },
                ],
              },
            },
          ],
        },
      },
    });
    tiedQuizId = tiedQuiz.id;

    // Assign tied quiz to s1, s2, s3
    const a1 = await prisma.quizAssignment.create({
      data: { quizId: tiedQuizId, studentId: student1Id, status: 'COMPLETED' },
    });
    const a2 = await prisma.quizAssignment.create({
      data: { quizId: tiedQuizId, studentId: student2Id, status: 'COMPLETED' },
    });
    const a3 = await prisma.quizAssignment.create({
      data: { quizId: tiedQuizId, studentId: student3Id, status: 'COMPLETED' },
    });

    // Create attempts: s1: 100%, s2: 100% (tied!), s3: 50%
    await prisma.quizAttempt.create({
      data: {
        quiz: { connect: { id: tiedQuizId } },
        student: { connect: { id: student1Id } },
        assignment: { connect: { id: a1.id } },
        score: 2,
        totalQuestions: 2,
        correctAnswers: 2,
        incorrectAnswers: 0,
        accuracy: 100.0,
      },
    });
    await prisma.quizAttempt.create({
      data: {
        quiz: { connect: { id: tiedQuizId } },
        student: { connect: { id: student2Id } },
        assignment: { connect: { id: a2.id } },
        score: 2,
        totalQuestions: 2,
        correctAnswers: 2,
        incorrectAnswers: 0,
        accuracy: 100.0,
      },
    });
    await prisma.quizAttempt.create({
      data: {
        quiz: { connect: { id: tiedQuizId } },
        student: { connect: { id: student3Id } },
        assignment: { connect: { id: a3.id } },
        score: 1,
        totalQuestions: 2,
        correctAnswers: 1,
        incorrectAnswers: 1,
        accuracy: 50.0,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await prisma.attemptAnswer.deleteMany({
        where: { attempt: { studentId: { in: [student1Id, student2Id, student3Id, student4Id] } } },
      });
      await prisma.quizAttempt.deleteMany({
        where: { studentId: { in: [student1Id, student2Id, student3Id, student4Id] } },
      });
      await prisma.quizAssignment.deleteMany({
        where: { studentId: { in: [student1Id, student2Id, student3Id, student4Id] } },
      });
      await prisma.option.deleteMany({
        where: { question: { quizId: { in: [testQuizId, unassignedQuizId, tiedQuizId].filter(Boolean) } } },
      });
      await prisma.question.deleteMany({
        where: { quizId: { in: [testQuizId, unassignedQuizId, tiedQuizId].filter(Boolean) } },
      });
      await prisma.quiz.deleteMany({
        where: { id: { in: [testQuizId, unassignedQuizId, tiedQuizId].filter(Boolean) } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [teacherId, student1Id, student2Id, student3Id, student4Id].filter(Boolean) } },
      });
    } catch {}

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
    const leaderboardRes = await request(app.getHttpServer())
      .get(`/quizzes/${tiedQuizId}/leaderboard`)
      .set('Authorization', `Bearer ${student1Token}`)
      .expect(200);

    const { leaderboard } = leaderboardRes.body;
    expect(leaderboard).toBeDefined();
    expect(leaderboard.length).toBe(3);

    // Entry 0: 100% -> Rank 1
    // Entry 1: 100% -> Rank 1 (Equal score = Equal rank!)
    // Entry 2: 50%  -> Rank 3 (Standard competition rank 1, 1, 3)
    const first = leaderboard[0];
    const second = leaderboard[1];
    const third = leaderboard[2];

    expect(first.accuracy).toBe(100.0);
    expect(first.rank).toBe(1);

    expect(second.accuracy).toBe(100.0);
    expect(second.rank).toBe(1); // Equal rank confirmed!

    expect(third.accuracy).toBe(50.0);
    expect(third.rank).toBe(3); // Rank 3 confirmed!
  });
});
