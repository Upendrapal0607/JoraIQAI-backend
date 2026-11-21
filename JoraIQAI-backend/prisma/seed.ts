import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.attemptAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizAssignment.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Teacher
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@joraiq.ai',
      name: 'Dr. Alan Turing',
      password: defaultPassword,
      role: 'TEACHER',
    },
  });
  console.log(` Created Teacher: ${teacher.email}`);

  // 2. Create Students
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@joraiq.ai',
      name: 'Ada Lovelace',
      password: defaultPassword,
      role: 'STUDENT',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@joraiq.ai',
      name: 'Grace Hopper',
      password: defaultPassword,
      role: 'STUDENT',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'student3@joraiq.ai',
      name: 'Claude Shannon',
      password: defaultPassword,
      role: 'STUDENT',
    },
  });

  const student4 = await prisma.user.create({
    data: {
      email: 'student4@joraiq.ai',
      name: 'Katherine Johnson',
      password: defaultPassword,
      role: 'STUDENT',
    },
  });
  console.log(' Created 4 Students (Ada Lovelace, Grace Hopper, Claude Shannon, Katherine Johnson)');

  // 3. Create Quiz 1: Artificial Intelligence & Foundations
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Artificial Intelligence & Machine Learning Fundamentals',
      description:
        'A comprehensive evaluation covering supervised learning, neural networks, transformers, and evaluation metrics.',
      teacherId: teacher.id,
      questions: {
        create: [
          {
            text: 'Which architectural component allows Transformer models to process input tokens in parallel rather than sequentially?',
            order: 0,
            options: {
              create: [
                { text: 'Recurrent Hidden Cells', isCorrect: false, order: 0 },
                { text: 'Multi-Head Self-Attention', isCorrect: true, order: 1 },
                { text: 'Convolutional Kernels', isCorrect: false, order: 2 },
                { text: 'Stochastic Gradient Decoupling', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'In classification tasks with severe class imbalance, which evaluation metric is generally preferable over raw Accuracy?',
            order: 1,
            options: {
              create: [
                { text: 'Mean Squared Error (MSE)', isCorrect: false, order: 0 },
                { text: 'F1-Score / PR-AUC', isCorrect: true, order: 1 },
                { text: 'R-Squared Score', isCorrect: false, order: 2 },
                { text: 'Cross-Entropy Loss Magnitude', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'What is the primary function of the Activation Function in a multi-layer perceptron neural network?',
            order: 2,
            options: {
              create: [
                { text: 'Introduce non-linearity to learn complex patterns', isCorrect: true, order: 0 },
                { text: 'Normalize input weights to sum to one', isCorrect: false, order: 1 },
                { text: 'Prevent gradient calculation in backward pass', isCorrect: false, order: 2 },
                { text: 'Speed up disk I/O during model checkpointing', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'Which technique is specifically used to prevent overfitting by randomly deactivating neurons during training?',
            order: 3,
            options: {
              create: [
                { text: 'Batch Normalization', isCorrect: false, order: 0 },
                { text: 'Dropout', isCorrect: true, order: 1 },
                { text: 'Gradient Clipping', isCorrect: false, order: 2 },
                { text: 'Learning Rate Warmup', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'In Reinforcement Learning from Human Feedback (RLHF), what is typically used to guide the policy model update?',
            order: 4,
            options: {
              create: [
                { text: 'A trained Reward Model based on human preference rankings', isCorrect: true, order: 0 },
                { text: 'Direct manual labeling of every generated sequence', isCorrect: false, order: 1 },
                { text: 'Static regex keyword filtering', isCorrect: false, order: 2 },
                { text: 'Pure unsupervised clustering without target rewards', isCorrect: false, order: 3 },
              ],
            },
          },
        ],
      },
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });
  console.log(` Created Quiz 1: "${quiz1.title}" with 5 questions.`);

  // 4. Create Quiz 2: Modern Full Stack Architecture
  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Full Stack Engineering & Microservices Architecture',
      description:
        'Evaluating core competencies in REST API design, NestJS decorators, relational database normalization, and caching.',
      teacherId: teacher.id,
      questions: {
        create: [
          {
            text: 'In NestJS, which concept is used to intercept and transform exceptions before sending HTTP responses to clients?',
            order: 0,
            options: {
              create: [
                { text: 'Interceptors', isCorrect: false, order: 0 },
                { text: 'Exception Filters', isCorrect: true, order: 1 },
                { text: 'Pipes', isCorrect: false, order: 2 },
                { text: 'Guards', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'Which HTTP status code should be returned when a resource creation fails due to a unique constraint violation (e.g. duplicate quiz submission)?',
            order: 1,
            options: {
              create: [
                { text: '400 Bad Request', isCorrect: false, order: 0 },
                { text: '409 Conflict', isCorrect: true, order: 1 },
                { text: '403 Forbidden', isCorrect: false, order: 2 },
                { text: '422 Unprocessable Entity', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'In database normalization, what distinguishes Third Normal Form (3NF) from Second Normal Form (2NF)?',
            order: 2,
            options: {
              create: [
                { text: 'Elimination of transitive functional dependencies on non-prime attributes', isCorrect: true, order: 0 },
                { text: 'Removal of repeating groups and multi-valued attributes', isCorrect: false, order: 1 },
                { text: 'Elimination of partial key dependencies', isCorrect: false, order: 2 },
                { text: 'Automatic generation of clustered foreign keys', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'Which React hook should be preferred to memoize a complex calculated value to prevent unnecessary recalculations on re-render?',
            order: 3,
            options: {
              create: [
                { text: 'useCallback', isCorrect: false, order: 0 },
                { text: 'useMemo', isCorrect: true, order: 1 },
                { text: 'useRef', isCorrect: false, order: 2 },
                { text: 'useLayoutEffect', isCorrect: false, order: 3 },
              ],
            },
          },
        ],
      },
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });
  console.log(` Created Quiz 2: "${quiz2.title}" with 4 questions.`);

  // 5. Assign Quiz 1 to Student 1, Student 2, Student 3
  const assign1 = await prisma.quizAssignment.create({
    data: {
      quizId: quiz1.id,
      studentId: student1.id,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 3600000 * 3),
    },
  });

  const assign2 = await prisma.quizAssignment.create({
    data: {
      quizId: quiz1.id,
      studentId: student2.id,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  const assign3 = await prisma.quizAssignment.create({
    data: {
      quizId: quiz1.id,
      studentId: student3.id,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 3600000 * 1),
    },
  });

  // Assign Quiz 2 to Student 1, Student 2, Student 4
  await prisma.quizAssignment.create({
    data: {
      quizId: quiz2.id,
      studentId: student1.id,
      status: 'PENDING',
    },
  });

  await prisma.quizAssignment.create({
    data: {
      quizId: quiz2.id,
      studentId: student2.id,
      status: 'PENDING',
    },
  });

  await prisma.quizAssignment.create({
    data: {
      quizId: quiz2.id,
      studentId: student4.id,
      status: 'PENDING',
    },
  });
  console.log(' Created Quiz Assignments for students.');

  // 6. Simulate Completed Attempts for Quiz 1:
  // Student 1: 5/5 (100% accuracy) -> Rank 1
  const attempt1 = await prisma.quizAttempt.create({
    data: {
      assignmentId: assign1.id,
      quizId: quiz1.id,
      studentId: student1.id,
      totalQuestions: 5,
      correctAnswers: 5,
      incorrectAnswers: 0,
      score: 5,
      accuracy: 100.0,
      submittedAt: new Date(Date.now() - 3600000 * 3),
    },
  });

  for (const q of quiz1.questions) {
    const correctOpt = q.options.find((o) => o.isCorrect)!;
    await prisma.attemptAnswer.create({
      data: {
        attemptId: attempt1.id,
        questionId: q.id,
        selectedOptionId: correctOpt.id,
        isCorrect: true,
      },
    });
  }

  // Student 2: 5/5 (100% accuracy) -> Rank 1 (Tied with Ada Lovelace!)
  const attempt2 = await prisma.quizAttempt.create({
    data: {
      assignmentId: assign2.id,
      quizId: quiz1.id,
      studentId: student2.id,
      totalQuestions: 5,
      correctAnswers: 5,
      incorrectAnswers: 0,
      score: 5,
      accuracy: 100.0,
      submittedAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  for (const q of quiz1.questions) {
    const correctOpt = q.options.find((o) => o.isCorrect)!;
    await prisma.attemptAnswer.create({
      data: {
        attemptId: attempt2.id,
        questionId: q.id,
        selectedOptionId: correctOpt.id,
        isCorrect: true,
      },
    });
  }

  // Student 3: 3/5 (60% accuracy) -> Rank 3
  const attempt3 = await prisma.quizAttempt.create({
    data: {
      assignmentId: assign3.id,
      quizId: quiz1.id,
      studentId: student3.id,
      totalQuestions: 5,
      correctAnswers: 3,
      incorrectAnswers: 2,
      score: 3,
      accuracy: 60.0,
      submittedAt: new Date(Date.now() - 3600000 * 1),
    },
  });

  for (let i = 0; i < quiz1.questions.length; i++) {
    const q = quiz1.questions[i];
    const correctOpt = q.options.find((o) => o.isCorrect)!;
    const wrongOpt = q.options.find((o) => !o.isCorrect)!;
    const isCorrect = i < 3; // First 3 correct, last 2 incorrect
    await prisma.attemptAnswer.create({
      data: {
        attemptId: attempt3.id,
        questionId: q.id,
        selectedOptionId: isCorrect ? correctOpt.id : wrongOpt.id,
        isCorrect,
      },
    });
  }

  console.log(' Created Completed Attempts & Answers for Quiz 1.');
  console.log('\n Demo Accounts:');
  console.log('   Teacher: teacher@joraiq.ai / password123');
  console.log('   Student 1: student1@joraiq.ai / password123 (Ada Lovelace - 100% on Quiz 1)');
  console.log('   Student 2: student2@joraiq.ai / password123 (Grace Hopper - 100% on Quiz 1)');
  console.log('   Student 3: student3@joraiq.ai / password123 (Claude Shannon - 60% on Quiz 1)');
  console.log('   Student 4: student4@joraiq.ai / password123 (Katherine Johnson - Pending)');
  console.log('\n Seed completed successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
