-- JoraIQ.AI Normalized Database Schema for Supabase PostgreSQL
-- Run this script in the Supabase SQL Editor to initialize all tables, relations, and indexes.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('TEACHER', 'STUDENT')),
    "supabaseUid" TEXT UNIQUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    "teacherId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "quizId" UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Options Table (4 options per question, 1 marked correct)
CREATE TABLE IF NOT EXISTS public.options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "questionId" UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT FALSE,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- 5. Quiz Assignments Table (Tracks teacher assignment to students)
CREATE TABLE IF NOT EXISTS public.quiz_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "quizId" UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    "studentId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED')),
    "completedAt" TIMESTAMPTZ,
    CONSTRAINT unique_quiz_student_assignment UNIQUE ("quizId", "studentId")
);

-- 6. Quiz Attempts Table (Enforces single submission per assignment)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "assignmentId" UUID UNIQUE NOT NULL REFERENCES public.quiz_assignments(id) ON DELETE CASCADE,
    "quizId" UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    "studentId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "incorrectAnswers" INTEGER NOT NULL,
    score INTEGER NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    "startedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "submittedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Attempt Answers Table (Audit trail of submitted choices)
CREATE TABLE IF NOT EXISTS public.attempt_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "attemptId" UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    "questionId" UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    "selectedOptionId" UUID NOT NULL REFERENCES public.options(id) ON DELETE CASCADE,
    "isCorrect" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher ON public.quizzes("teacherId");
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON public.questions("quizId");
CREATE INDEX IF NOT EXISTS idx_options_question ON public.options("questionId");
CREATE INDEX IF NOT EXISTS idx_assignments_student ON public.quiz_assignments("studentId");
CREATE INDEX IF NOT EXISTS idx_assignments_quiz ON public.quiz_assignments("quizId");
CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON public.quiz_attempts("quizId");
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.quiz_attempts("studentId");
CREATE INDEX IF NOT EXISTS idx_attempts_accuracy ON public.quiz_attempts(accuracy DESC);
