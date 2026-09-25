# QuizMaster - Full-Stack Online Quiz & Assessment System

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Backend-Python%20Flask-3776AB?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Bootstrap](https://img.shields.io/badge/UI-Bootstrap%205-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![Chart.js](https://img.shields.io/badge/Analytics-Chart.js-FF6384?style=flat-square&logo=chartdotjs)](https://www.chartjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

An enterprise-grade, full-stack **Online Quiz and Examination System** designed for academic evaluations, university capstone projects, coding portfolios, and competitive assessments. Features role-based access (Administrator and Student), timed examinations with anti-cheat measures, server-side score calculation, Chart.js analytics, answer reviews, leaderboards, and an AI educational study assistant.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture & Data Flow](#architecture--data-flow)
5. [Database Design](#database-design)
6. [API Specification](#api-specification)
7. [Installation & Setup](#installation--setup)
   - [Prerequisites](#prerequisites)
   - [Database Setup](#database-setup)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
8. [Demonstration Credentials](#demonstration-credentials)
9. [Anti-Cheat & Security Measures](#anti-cheat--security-measures)
10. [Screenshots & UI Showcase](#screenshots--ui-showcase)
11. [Testing & Verification](#testing--verification)
12. [Future Improvements](#future-improvements)
13. [Author & Acknowledgments](#author--acknowledgments)

---

## Project Overview

**QuizMaster** bridges academic testing and real-time conceptual learning. Unlike static demo sites, every button, route guard, timer tick, score evaluation, and chart is powered by a real backend API and relational database.

### Two Dedicated Roles:
- **Administrator**: Complete control over quiz creation, metadata configuration, question authoring (options A-D, marks, correct answer keys), status toggles (published/draft/inactive), student monitoring, and aggregate Chart.js analytical reports.
- **Student**: Account registration, password encryption, catalog browsing with search and category filters, timed quiz taking with question palette navigation, instant score calculation with pass/fail evaluation, question-by-question answer review, persistent attempt history, competitive leaderboards, and an AI-powered conversational study assistant.

---

## Key Features

### 👨‍🎓 Student Experience
- **Interactive Quiz Engine**:
  - Live MM:SS countdown timer synchronized to quiz duration.
  - Visual pulse alert when remaining time is less than 2 minutes.
  - Automatic test submission when the countdown reaches 00:00.
  - Question palette navigation showing answered vs. unanswered status.
  - Prevention of accidental page refreshes.
- **Instant Server-Side Results**:
  - Accurate server calculation of score, total marks, percentage, correct/wrong/unanswered counts, and elapsed time.
  - Chart.js visual doughnut chart breaking down answer accuracy.
  - Detailed Question-by-Question Review highlighting the student's answer vs. the true correct answer with clear status badges.
- **Academic Progress & Competitive Leaderboard**:
  - Persistent attempt history with direct links to review past tests.
  - Top 3 podium display (Gold, Silver, Bronze) and ranked table filtered by quiz topic.
  - Profile statistics: Total attempts, average score %, and highest score.
- **AI Study Assistant**:
  - In-app chatbot capable of answering conceptual questions in Python, Database Management Systems (DBMS), and Web Development.
  - Chat session history saved directly to MySQL.

### 🛡️ Administrator Command Center
- **Executive Analytics Dashboard**:
  - Summary metric cards: Total Students, Total Quizzes, Total Questions, Total Attempts, and Average Platform Score.
  - Chart.js visual graphs: Quiz popularity (attempts per quiz), grade distribution, and submissions over time.
  - Live table of recent student quiz submissions.
- **Full Quiz Management (CRUD)**:
  - Create quizzes specifying title, category, difficulty (Easy/Medium/Hard), time limit (minutes), and publication status.
  - Edit existing quiz metadata.
  - One-click status toggling (Published / Inactive / Draft).
  - Cascading deletion with confirmation modal protection.
- **Question Bank Management (CRUD)**:
  - Select any quiz to manage its question pool.
  - Add and edit questions with custom prompts, four options (A, B, C, D), correct answer key, and marks.
  - Auto-updates total questions count on the quiz.
- **Student Monitoring & Reports**:
  - Comprehensive user directory showing registered students, attempt counts, and average scores.
  - Print-ready assessment performance reports.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, JavaScript (ES6+), React Router DOM v6, Axios, Bootstrap 5, Bootstrap Icons, Chart.js, react-chartjs-2 |
| **Backend** | Python 3.11+, Flask 3, Flask-CORS, PyMySQL, PyJWT, Werkzeug (scrypt hashing), python-dotenv, requests |
| **Database** | MySQL Server 8.0 (InnoDB, utf8mb4, foreign keys with ON DELETE CASCADE, b-tree indexes) |
| **AI Integration** | Google Gemini API / Intelligent Academic Fallback Tutor Engine |
| **Architecture** | Client-Server Single Page Application (SPA) communicating over RESTful JSON APIs |

---

## Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       React SPA (Vite)                      │
│   Components  •  Pages  •  AuthContext  •  Chart.js Visuals │
└──────────────────────────────┬──────────────────────────────┘
                               │ Axios HTTP + JWT Bearer
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Flask REST API Backend                   │
│   /api/auth   •  /api/admin   •  /api/quizzes   •  /api/chat│
│   JWT Decoders  •  Server Evaluator  •  Werkzeug Security   │
└──────────────────────────────┬──────────────────────────────┘
                               │ PyMySQL Connection Pool
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   MySQL 8.0 Database                        │
│   users • quizzes • questions • attempts • answers • chat   │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Design

Database Name: `online_quiz_system`

### 1. `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Unique user ID |
| `name` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | User email address |
| `password` | VARCHAR(255) | NOT NULL | Werkzeug scrypt password hash |
| `role` | ENUM | NOT NULL, DEFAULT 'student' | 'admin' or 'student' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |

### 2. `quizzes`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Unique quiz ID |
| `title` | VARCHAR(255) | NOT NULL | Quiz title |
| `description`| TEXT | NULL | Summary of covered topics |
| `category` | VARCHAR(100) | NOT NULL | Topic (e.g. Python, DBMS) |
| `difficulty` | ENUM | NOT NULL, DEFAULT 'medium'| 'easy', 'medium', 'hard' |
| `time_limit` | INT | NOT NULL | Duration in minutes |
| `total_questions` | INT | NOT NULL, DEFAULT 0 | Count of questions |
| `status` | ENUM | NOT NULL, DEFAULT 'published' | 'published', 'draft', 'inactive' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last modified timestamp |

### 3. `questions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Unique question ID |
| `quiz_id` | INT | FOREIGN KEY (quizzes.id) | Parent quiz ID |
| `question` | TEXT | NOT NULL | Question prompt |
| `option_a` | VARCHAR(255) | NOT NULL | Option A text |
| `option_b` | VARCHAR(255) | NOT NULL | Option B text |
| `option_c` | VARCHAR(255) | NOT NULL | Option C text |
| `option_d` | VARCHAR(255) | NOT NULL | Option D text |
| `correct_answer` | ENUM | NOT NULL | Correct key: 'A', 'B', 'C', 'D' |
| `marks` | INT | NOT NULL, DEFAULT 1 | Marks awarded |

### 4. `attempts`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Unique attempt ID |
| `user_id` | INT | FOREIGN KEY (users.id) | Student user ID |
| `quiz_id` | INT | FOREIGN KEY (quizzes.id) | Quiz ID |
| `score` | INT | NOT NULL, DEFAULT 0 | Earned marks |
| `total_marks`| INT | NOT NULL, DEFAULT 0 | Maximum possible marks |
| `percentage` | DECIMAL(5,2)| NOT NULL, DEFAULT 0.00 | Score percentage |
| `correct_answers` | INT | NOT NULL, DEFAULT 0 | Correct answers count |
| `wrong_answers` | INT | NOT NULL, DEFAULT 0 | Incorrect answers count |
| `unanswered` | INT | NOT NULL, DEFAULT 0 | Skipped questions count |
| `time_taken` | INT | NOT NULL, DEFAULT 0 | Time elapsed in seconds |
| `attempted_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |

### 5. `answers`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Unique answer entry ID |
| `attempt_id` | INT | FOREIGN KEY (attempts.id) | Parent attempt ID |
| `question_id`| INT | FOREIGN KEY (questions.id) | Question ID |
| `selected_answer` | VARCHAR(10) | NULL | Option chosen ('A'-'D' or NULL) |
| `correct_answer` | VARCHAR(10) | NOT NULL | Correct answer key |
| `is_correct` | TINYINT(1) | NOT NULL, DEFAULT 0 | 1 = Correct, 0 = Incorrect |

### 6. `chat_messages`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Unique message ID |
| `user_id` | INT | FOREIGN KEY (users.id) | Student user ID |
| `message` | TEXT | NOT NULL | Student's query |
| `response` | TEXT | NOT NULL | AI tutor response |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

---

## API Specification

All API endpoints return standard JSON responses:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Authentication Endpoints
- `POST /api/register`: Create a new student account.
- `POST /api/login`: Authenticate email and password; returns JWT token and user profile.
- `POST /api/logout`: Logout endpoint.
- `GET  /api/me`: Get current authenticated user profile and stats.
- `PUT  /api/profile`: Update user display name.
- `PUT  /api/change-password`: Update password with current password verification.

### Public & Student Quiz Endpoints
- `GET  /api/quizzes`: List published quizzes with optional `search`, `category`, and `difficulty` query params.
- `GET  /api/quizzes/<id>`: Get quiz details for instructions page.
- `GET  /api/quizzes/<id>/questions`: **Secure taking endpoint.** Strictly omits `correct_answer`.
- `POST /api/submit-quiz`: Submit answers `{ quiz_id, time_taken, answers }`. Evaluated on server.
- `GET  /api/history`: List all previous attempts for the logged-in student.
- `GET  /api/history/<id>`: Get question-by-question review with student answer and correct answer.
- `GET  /api/leaderboard`: Fetch ranked leaderboard (optional `?quiz_id=...`).
- `POST /api/chat`: Send query to AI educational tutor.
- `GET  /api/chat/history`: Retrieve past chat messages.
- `DELETE /api/chat/history`: Clear conversation history.

### Administrator Endpoints (`/api/admin/*`, requires Admin role)
- `GET    /api/admin/statistics`: Aggregate counts and datasets for Chart.js.
- `GET    /api/admin/users`: List registered students with attempt metrics.
- `GET    /api/admin/quizzes`: Full list of all quizzes.
- `POST   /api/admin/quizzes`: Create a new quiz.
- `GET    /api/admin/quizzes/<id>`: Get quiz details for editing.
- `PUT    /api/admin/quizzes/<id>`: Update quiz metadata.
- `PATCH  /api/admin/quizzes/<id>/status`: Toggle status (published/draft/inactive).
- `DELETE /api/admin/quizzes/<id>`: Delete quiz cascadingly.
- `GET    /api/admin/quizzes/<id>/questions`: Get all questions with correct answer keys.
- `POST   /api/admin/quizzes/<id>/questions`: Add question to a quiz.
- `GET    /api/admin/questions/<id>`: Get single question details.
- `PUT    /api/admin/questions/<id>`: Update question content.
- `DELETE /api/admin/questions/<id>`: Delete question.

---

## Installation & Setup

### Prerequisites
- **Node.js**: v18+ (verified on v25.6.1)
- **Python**: 3.10+ (verified on 3.11.9)
- **MySQL Server**: 8.0+

---

### Database Setup

1. Verify your MySQL server is running.
2. Open `backend/.env` and ensure your database credentials match your local MySQL Server:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=online_quiz_system
   ```
3. Run the automated database initializer:
   ```bash
   cd backend
   python init_db.py
   ```
   *Alternatively*, you can execute `backend/database/schema.sql` directly inside **MySQL Workbench** or the **MySQL Command Line Client**:
   ```sql
   source /path/to/OnlineQuizSystem/backend/database/schema.sql;
   ```

---

### Backend Setup

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows PowerShell**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask server:
   ```bash
   python app.py
   ```
   The backend API will run on `http://127.0.0.1:5000`.

---

### Frontend Setup

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## Demonstration Credentials

Pre-seeded accounts are provided for instant evaluation and presentation:

| Role | Email | Password | Pre-seeded Activity |
|---|---|---|---|
| **System Administrator** | `admin@quizsystem.com` | `Admin@123` | Full administrative privileges |
| **Student 1 (Alex)** | `student1@quizsystem.com` | `Student@123` | Completed Python & DBMS quizzes (Leaderboard Rank #1) |
| **Student 2 (Maria)** | `student2@quizsystem.com` | `Student@123` | Completed Python quiz (Leaderboard Rank #2) |
| **Student 3 (David)** | `student3@quizsystem.com` | `Student@123` | Completed Python quiz (Leaderboard Rank #3) |

> **Credentials Note**: Use the credentials table above to sign in as either the System Administrator or any enrolled Student account.

---

## Anti-Cheat & Security Measures

1. **Zero Client-Side Correct Answers**:
   When taking a quiz, `/api/quizzes/<id>/questions` returns strictly `id`, `question`, `option_a`, `option_b`, `option_c`, `option_d`, and `marks`. Correct answers are never sent to the browser prior to submission.
2. **Server-Side Scoring**:
   The frontend only sends `{ question_id: selected_option }`. The Flask server compares these against database records, preventing any score tampering via client-side scripts.
3. **Timed Auto-Submission**:
   When the countdown reaches `00:00`, the quiz engine automatically triggers submission and locks the choices.
4. **Role-Based Authorization**:
   - Backend `@token_required` and `@admin_required` decorators ensure only administrators can manage quizzes or view student data.
   - Frontend `AdminRoute` and `StudentRoute` guard views to prevent unauthorized access.
5. **SQL Injection & Password Protection**:
   - Parameterized SQL queries are used throughout all database access.
   - Passwords are encrypted using Werkzeug's `scrypt` hashing algorithm.
   - API keys and database credentials are stored in `.env` and never bundled into frontend assets.

---

## Testing & Verification

### Automated Verification Checklist
- [x] Database creation and schema migration (`init_db.py`)
- [x] User registration with format and duplicate validation
- [x] JWT authentication and role-based token decoding
- [x] Quiz creation, editing, status toggles, and deletion
- [x] Question creation and option validation
- [x] Stripped taking endpoint (`correct_answer` excluded)
- [x] Server-side answer evaluation and attempt logging
- [x] Chart.js dynamic dashboard data rendering
- [x] Question-by-question review with visual status indicators
- [x] AI study assistant with conceptual responses

---

## Future Improvements
- **PDF Certificate Generation**: Automatic downloadable course completion certificates for scores above 80%.
- **Audio/Visual Questions**: Support for image and diagram-based quiz questions.
- **Randomized Question Orders**: Shuffling question order and option choices per student.
- **Export to CSV**: Downloadable CSV reports of quiz attempts for faculty members.

---

## Author & Acknowledgments

- **Developer**: Senior Full-Stack Software Engineer & UI/UX Designer
- **Built for**: College Final-Year Project, Portfolio & Demonstration
- **License**: Open-source under the MIT License.
