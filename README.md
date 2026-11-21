# JoraIQ.AI — Quiz-Based Learning & Precision Analytics Platform

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest%20Tests-Passing-brightgreen?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

> **Full Stack Product Engineering Assessment (2–4 Years)**  
> Built for **JoraIQ.AI** — empowering personalized learning, practice, and mastery through precision analytics.

---

## 🌟 Executive Overview & Key Features

JoraIQ.AI is a production-grade, end-to-end learning platform that enables instructors to create assessments, assign them to targeted student cohorts, track real-time accuracy and question difficulty diagnostics, while students attempt quizzes under strict single-submission enforcement and compare their mastery on fair, competition-ranked leaderboards.

### 👥 Dual-Role System
1. **Teacher / Instructor**
   - **Quiz Authoring**: Create quizzes with title, description, and multiple-choice questions (4 options each, marking exactly 1 correct answer).
   - **Student Cohort Assignment**: View the real-time student directory, search/filter, select multiple students, and assign assessments with zero duplicate collisions.
   - **Performance Analytics**: Real-time cohort metrics including completion rate, average accuracy percentage, student-wise score breakdowns, and question-level difficulty diagnostics.
   - **Leaderboard Oversight**: View competition rankings with tie-handling across all participants.

2. **Student / Learner**
   - **Assigned Quizzes Portal**: Filter between **Pending** and **Completed** assignments.
   - **Distraction-Free Quiz Attempt**: Clean stepper UI, progress bar, instant review before submission.
   - **Security Guarantee**: Correct-answer keys are **never** delivered to students before submission.
   - **Server-Side Scoring**: Instant server-side grade calculation upon submission.
   - **Single Submission Enforcement**: Students can only submit once per assignment (preventing duplicate or re-attempt exploits).
   - **Interactive Results & Explanation**: Post-submission question breakdown revealing what the student selected vs the correct answer key.
   - **Peer Leaderboards**: Compare accuracy with cohort peers (tied accuracy receives equal ranks; current student entry is highlighted).

---

## 🏗️ Architecture & Technical Stack

```
                              ┌───────────────────────────────────────────────┐
                              │             NEXT.JS FRONTEND (Port 3000)      │
                              │  - App Router, Tailwind CSS, Lucide Icons     │
                              │  - Client-side AuthContext & Role Routing     │
                              │  - 1-Click Instant Demo Role Switcher         │
                              └──────────────────────┬────────────────────────┘
                                                     │ REST (Bearer JWT)
                                                     ▼
                              ┌───────────────────────────────────────────────┐
                              │             NESTJS BACKEND (Port 4000)        │
                              │  - Role Guards (@Roles(TEACHER / STUDENT))    │
                              │  - Passport JWT Strategy + Supabase Auth Sync │
                              │  - Normalized Transactions & Server-Side Calc │
                              │  - Swagger OpenAPI Documentation (/api/docs)  │
                              └──────────────────────┬────────────────────────┘
                                                     │ Prisma ORM
                                                     ▼
                              ┌───────────────────────────────────────────────┐
                              │           DATABASE (PostgreSQL / SQLite)       │
                              │  - Normalized Relational Data Model           │
                              │  - Zero-friction Local DB (dev.db)            │
                              │  - Production: Supabase PostgreSQL (schema.sql)│
                              └───────────────────────────────────────────────┘
```

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React 18, TypeScript | High-performance App Router with responsive Tailwind CSS |
| **Backend** | NestJS 10, Node.js 22, TypeScript | Modular REST API with dependency injection & strict DTO validation |
| **Authentication** | Supabase Auth + JWT Bearer Strategy | Dual-mode: Supports native Supabase Auth + zero-config local JWT |
| **Database** | Supabase PostgreSQL / Prisma ORM | Normalized relational schema with foreign keys, indexes & cascade rules |
| **Documentation** | Swagger / OpenAPI 3.0 | Interactive API docs available at `http://localhost:4000/api/docs` |
| **Testing** | Jest, Supertest | 100% automated coverage of the 5 mandatory assessment rules |

---

## ⚡ Quick Start (Local Setup)

The repository is structured with separate `JoraIQAI-backend` and `JoraIQAI-frontend` folders.

### 1. Prerequisites
- **Node.js**: v18+ (tested on v22)
- **npm** or **pnpm**

### 2. Backend Setup (`JoraIQAI-backend`)
```bash
cd JoraIQAI-backend

# 1. Install dependencies
npm install

# 2. Push database schema (creates local SQLite zero-config database)
npx prisma db push

# 3. Seed demo accounts, quizzes, and completed attempts
npm run seed

# 4. Start NestJS server in development mode
npm run start:dev
```
> The backend runs at **`http://localhost:4000`**.  
> Explore Swagger API Docs at **`http://localhost:4000/api/docs`**.

### 3. Frontend Setup (`JoraIQAI-frontend`)
Open a new terminal:
```bash
cd JoraIQAI-frontend

# 1. Install dependencies
npm install

# 2. Start Next.js development server
npm run dev
```
> The application will be accessible at **`http://localhost:3000`**.

---

## 🔑 Demo Accounts & Pre-Seeded Data

The seed script (`npm run seed`) automatically prepares demo data for instant evaluation:

| Role | Name | Email | Password | Pre-seeded Status |
| :--- | :--- | :--- | :--- | :--- |
| **Teacher** | Dr. Alan Turing | `teacher@joraiq.ai` | `password123` | Author of 2 quizzes with student analytics |
| **Student 1** | Ada Lovelace | `student1@joraiq.ai` | `password123` | **Rank #1** (100% Accuracy on Quiz 1, Quiz 2 Pending) |
| **Student 2** | Grace Hopper | `student2@joraiq.ai` | `password123` | **Rank #1 (Tied)** (100% Accuracy on Quiz 1, Quiz 2 Pending) |
| **Student 3** | Claude Shannon | `student3@joraiq.ai` | `password123` | **Rank #3** (60% Accuracy on Quiz 1) |
| **Student 4** | Katherine Johnson| `student4@joraiq.ai` | `password123` | Fresh Student (Quiz 2 Pending attempt) |

> 💡 **Tip**: On the homepage (`/`) and login page (`/login`), use the **1-Click Demo Evaluation buttons** or the **Switch Role dropdown** in the navbar to switch personas instantly without typing passwords.

---

## 🧪 Automated Testing Suite (Mandatory Requirements)

Run the automated test suite in `JoraIQAI-backend`:
```bash
cd JoraIQAI-backend
npm test
```

### Verified Test Cases:
```
PASS test/assessment.e2e-spec.ts
  JoraIQ.AI Assessment Automated Test Suite (Mandatory Requirements)
    ✓ Requirement 1: Should successfully submit quiz and calculate score server-side
    ✓ Requirement 2: Should reject a second submission for the same assignment with 409 Conflict
    ✓ Requirement 3: Should reject when a student attempts to take an unassigned quiz with 403 Forbidden
    ✓ Requirement 4: Should reject when a student attempts a teacher-only operation with 403 Forbidden
    ✓ Requirement 5: Should assign equal ranks to students with equal scores (Standard Competition Ranking)
```

---

## 🗄️ Database Schema & Supabase PostgreSQL Setup

The project uses a normalized relational data model:

```mermaid
erDiagram
    users ||--o{ quizzes : "creates (teacherId)"
    users ||--o{ quiz_assignments : "assigned to (studentId)"
    users ||--o{ quiz_attempts : "submits (studentId)"
    quizzes ||--o{ questions : "contains (quizId)"
    questions ||--o{ options : "has 4 choices (questionId)"
    quizzes ||--o{ quiz_assignments : "assigned via (quizId)"
    quizzes ||--o{ quiz_attempts : "attempted for (quizId)"
    quiz_assignments ||--|| quiz_attempts : "1-to-1 attempt (assignmentId)"
    quiz_attempts ||--o{ attempt_answers : "records choices"
    questions ||--o{ attempt_answers : "answers question"
    options ||--o{ attempt_answers : "selected option"
```

### Supabase PostgreSQL Production Setup
1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the DDL script located at:
   [`JoraIQAI-backend/supabase_schema.sql`](./JoraIQAI-backend/supabase_schema.sql).
4. Update `DATABASE_URL` in `JoraIQAI-backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```
5. In `JoraIQAI-backend/prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
6. Run `npx prisma db push && npm run seed`.

---

## 📡 REST API Reference

All backend endpoints are prefixed with the base URL `http://localhost:4000`:

### Authentication & Profiles
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new Teacher or Student |
| `POST` | `/auth/login` | Public | Login with email and password |
| `POST` | `/auth/supabase-sync`| Public | Sync user session from Supabase Auth |
| `GET` | `/auth/me` | Bearer | Retrieve authenticated profile |

### Quizzes (Teacher & Student)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/quizzes` | Teacher | Create quiz with MCQ questions & correct keys |
| `GET` | `/quizzes/teacher` | Teacher | List quizzes created by authenticated teacher |
| `GET` | `/quizzes/:id/teacher`| Teacher | View quiz details with answer keys and assignments |
| `GET` | `/quizzes/:id/take` | Student | Fetch assigned questions (**answer keys stripped**) |
| `DELETE`| `/quizzes/:id` | Teacher | Delete quiz and cascade child records |

### Assignments & Student Portal
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/quizzes/:id/assign` | Teacher | Assign quiz to array of `studentIds` |
| `GET` | `/quizzes/:id/assignments`| Teacher | View completion status of all assigned students |
| `GET` | `/student/quizzes` | Student | List quizzes assigned to current student |
| `GET` | `/users/students` | Teacher | List available students directory for assignment |

### Attempts, Scoring & Results
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/quizzes/:id/submit` | Student | Submit answers; server computes score (single-submission) |
| `GET` | `/quizzes/:id/result` | Student | View completed score and unlocked answer breakdown |
| `GET` | `/attempts/:id` | Both | View attempt details and question-level review |

### Analytics & Leaderboards
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics/overview` | Teacher | Global KPI metrics (total quizzes, completion rate, accuracy) |
| `GET` | `/quizzes/:id/analytics`| Teacher | Quiz analytics, student accuracy table, question diagnostics |
| `GET` | `/quizzes/:id/leaderboard`| Both* | Leaderboard ranked by accuracy (restricted to assigned cohort) |

---

## 📐 Assumptions, Trade-offs & Engineering Decisions

1. **Answer Key Protection**:
   - Students **never** receive the `isCorrect` field when fetching quiz questions (`/quizzes/:id/take`).
   - Answers and score calculation are strictly executed server-side.
   - Question explanations and correct keys are unlocked only *after* the attempt is recorded as `COMPLETED`.

2. **Single-Submission Guarantee**:
   - The database enforces a `UNIQUE` constraint on `quiz_attempts.assignmentId`.
   - The application layer throws a `409 Conflict` if a second submission is attempted.

3. **Leaderboard Ranking Logic**:
   - Implements **Standard Competition Ranking** (1224 ranking): students with identical accuracy receive identical ranks (e.g., Ada Lovelace 100% Rank 1, Grace Hopper 100% Rank 1, Claude Shannon 60% Rank 3).
   - Only completed attempts are ranked; unattempted students do not dilute the leaderboard.
   - Access control verifies that only students assigned to that quiz or the quiz author can view the leaderboard.

4. **Dual-Mode Database & Auth Architecture**:
   - Built to run seamlessly both **offline/locally** (zero-config SQLite) and **online/production** (Supabase PostgreSQL).
   - This ensures interviewers and automated CI pipelines can clone and test the repository without needing external database credentials or network access.

---

## 📽️ Demo Video Walkthrough Guide (3–5 min)

When recording the demo walkthrough, follow this flow:
1. **Teacher Login**: Click "Teacher Account" on the home screen or log in with `teacher@joraiq.ai` / `password123`.
2. **Quiz Creation**: Navigate to "Create New Quiz", enter a title (e.g. "Cloud Computing"), add questions with 4 options, and mark the correct answer.
3. **Student Assignment**: On the Assign screen, search and select students (e.g. Katherine Johnson) and click "Assign Selected Students".
4. **Student Quiz Attempt**: Switch persona to the student via the top-right role switcher or `/login`. View the assigned quiz under "Pending", start the quiz, select options, and submit.
5. **Score & Leaderboard**: Observe the confetti score card, review correct/incorrect answers, and open the Leaderboard to view peer rankings.
6. **Teacher Analytics**: Switch back to Teacher, navigate to Analytics for the quiz, and demonstrate the updated completion rate, average accuracy, and student breakdown.
