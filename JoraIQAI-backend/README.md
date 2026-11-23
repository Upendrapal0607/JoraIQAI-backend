# JoraIQ.AI Backend — NestJS REST API & Data Layer

A production-grade, modular NestJS REST API powering the JoraIQ.AI Quiz-Based Learning & Analytics Platform.

---

## 🏛️ Architecture & System Design

All business logic, database mutations, role validations, scoring algorithms, and security checks are strictly executed on this backend.

```
src/
├── app.module.ts                         # Root application module
├── main.ts                               # Bootstrap, Swagger, CORS, ValidationPipe, Filters
├── database/                             # Database module
│   ├── prisma.service.ts                 # Prisma Client lifecycle management
│   └── database.module.ts                # Global database provider
├── common/                               # Cross-cutting concerns
│   ├── decorators/                       # @Roles, @CurrentUser, @Public
│   ├── enums/                            # Role (TEACHER, STUDENT)
│   ├── filters/                          # HttpExceptionFilter (unified error format)
│   ├── guards/                           # JwtAuthGuard, RolesGuard
│   └── interceptors/                     # ResponseTransformInterceptor ({ success, status, data })
└── modules/                              # Domain feature modules
    ├── auth/                             # Registration, Login, JWT issuing, Password hashing (bcrypt)
    ├── users/                            # Student directory listing for assignments
    ├── quizzes/                          # Quiz creation, question stripping for student security
    ├── assignments/                      # Cohort distribution, assignment tracking, duplicate prevention
    ├── attempts/                         # Server-side score calculation, single-submission enforcement
    ├── leaderboard/                      # Standard Competition Ranking (1224) with tie handling
    ├── analytics/                        # Cohort metrics, average accuracy, question diagnostics
    └── health/                           # Server & database health checks (uptime, DB latency, ping)
```

---

## 🚀 Setup & Local Execution

### 1. Prerequisites
- **Node.js**: v18.x or v22.x
- **npm** or **pnpm**

### 2. Environment Configuration
Create or inspect `.env` in `JoraIQAI-backend/`:
```env
# Server
PORT=4000
FRONTEND_URL=http://localhost:3000

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Database (Default: Local SQLite for zero-config offline execution)
DATABASE_URL="file:./dev.db"

# Production Supabase PostgreSQL:
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 3. Install Dependencies & Push Schema
```bash
npm install
npx prisma db push
```

### 4. Run Server
```bash
# Development (hot reload)
npm run start:dev

# Production build & start
npm run build
npm run start:prod
```
The server will start at **`http://localhost:4000`**.  
Interactive OpenAPI/Swagger documentation is available at **`http://localhost:4000/api/docs`**.

---

## 🧪 Automated Testing

The backend includes a comprehensive E2E test suite covering the 5 mandatory assessment rules:

```bash
npm test
```

### Covered Test Specifications ([test/assessment.e2e-spec.ts](test/assessment.e2e-spec.ts)):
1. **Rule 1: Server-Side Score Calculation**: Verifies answer keys are stripped when taking a quiz (`GET /quizzes/:id/take`) and accuracy is computed strictly on the backend upon submission.
2. **Rule 2: Duplicate Submission Rejection**: Asserts that submitting an already completed assignment returns `409 Conflict`.
3. **Rule 3: Unassigned Quiz Access Protection**: Asserts that a student attempting an unassigned quiz is rejected with `403 Forbidden`.
4. **Rule 4: Role-Based Authorization**: Asserts that student tokens attempting teacher-only routes (`POST /quizzes`, `GET /users/students`, `GET /analytics/overview`) receive `403 Forbidden`.
5. **Rule 5: Standard Competition Ranking with Equal Tiers**: Verifies students with equal accuracy receive equal ranks (e.g. 100% Rank 1, 100% Rank 1, 50% Rank 3).

---

## 📡 REST API Specifications

### 🩺 Health Checks (Public)
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Full health check: server status, DB ping & latency, uptime, memory |
| `GET` | `/health/ping` | Fast liveness probe returning `{"ping": "pong"}` |

### 🔐 Authentication (Public & Protected)
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register user (`TEACHER` or `STUDENT`) with bcrypt password |
| `POST` | `/auth/login` | Public | Authenticate user and issue JWT bearer token |
| `GET` | `/auth/me` | Bearer | Retrieve authenticated user profile |

### 📝 Quizzes (Role Protected)
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/quizzes` | Teacher | Create quiz with multiple-choice questions and answer keys |
| `GET` | `/quizzes/teacher` | Teacher | List quizzes authored by the logged-in teacher |
| `GET` | `/quizzes/:id/teacher` | Teacher | Get quiz details with answer keys and assignment roster |
| `GET` | `/quizzes/:id/take` | Student | Fetch questions for assigned quiz (**`isCorrect` stripped for security**) |
| `DELETE` | `/quizzes/:id` | Teacher | Delete quiz and cascade child records |

### 👥 Student Assignments & Directory
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/students` | Teacher | List registered students directory for assignment |
| `POST` | `/quizzes/:id/assign` | Teacher | Assign quiz to selected `studentIds` |
| `GET` | `/quizzes/:id/assignments`| Teacher | View roster completion status (`PENDING` vs `COMPLETED`) |
| `GET` | `/student/quizzes` | Student | List quizzes assigned to current student (filter by status) |

### 🎯 Quiz Attempts & Results
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/quizzes/:id/submit` | Student | Submit answers; server computes score; enforces single attempt |
| `GET` | `/quizzes/:id/result` | Student | Get completed score and review breakdown |
| `GET` | `/attempts/:id` | Both | View attempt details and question-by-question review |

### 📊 Analytics & Leaderboards
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics/overview` | Teacher | Global KPI metrics (total quizzes, completion rate, accuracy) |
| `GET` | `/quizzes/:id/analytics` | Teacher | Per-quiz analytics, accuracy distribution, question diagnostics |
| `GET` | `/quizzes/:id/leaderboard` | Both* | Quiz leaderboard ranked by accuracy (assigned cohort access only) |

---

## 🛡️ Validation & Error Response Standards

All endpoints enforce strict class-validator DTOs and handle exceptions via `HttpExceptionFilter`:

```json
{
  "statusCode": 409,
  "timestamp": "2026-11-23T01:36:51.040Z",
  "path": "/quizzes/quiz-uuid/submit",
  "method": "POST",
  "message": "You have already submitted an attempt for this quiz assignment."
}
```

| HTTP Status | Scenario |
| :--- | :--- |
| **`200 OK` / `201 Created`** | Successful retrieval, assignment, or resource creation |
| **`400 Bad Request`** | Validation failure (e.g., question has fewer than 4 options or no correct option marked) |
| **`401 Unauthorized`** | Missing or expired JWT Bearer token |
| **`403 Forbidden`** | Role mismatch (Student attempting teacher action) or unassigned student attempting quiz |
| **`404 Not Found`** | Requested quiz, assignment, or user does not exist |
| **`409 Conflict`** | Duplicate submission attempt for an already completed assignment |
