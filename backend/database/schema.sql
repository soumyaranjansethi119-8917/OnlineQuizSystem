-- ===================================================
-- Online Quiz System Database Schema
-- Database: online_quiz_system
-- ===================================================

CREATE DATABASE IF NOT EXISTS online_quiz_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE online_quiz_system;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
    time_limit INT NOT NULL COMMENT 'Time limit in minutes',
    total_questions INT NOT NULL DEFAULT 0,
    status ENUM('draft', 'published', 'inactive') NOT NULL DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_quiz_status (status),
    INDEX idx_quiz_category (category)
) ENGINE=InnoDB;

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
    marks INT NOT NULL DEFAULT 1,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_question_quiz (quiz_id)
) ENGINE=InnoDB;

-- 4. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    total_marks INT NOT NULL DEFAULT 0,
    percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    correct_answers INT NOT NULL DEFAULT 0,
    wrong_answers INT NOT NULL DEFAULT 0,
    unanswered INT NOT NULL DEFAULT 0,
    time_taken INT NOT NULL DEFAULT 0 COMMENT 'Time taken in seconds',
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_attempt_user (user_id),
    INDEX idx_attempt_quiz (quiz_id),
    INDEX idx_attempt_score (score)
) ENGINE=InnoDB;

-- 5. Answers Table (Detail of each attempt)
CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer VARCHAR(10) NULL COMMENT 'A, B, C, D, or NULL',
    correct_answer VARCHAR(10) NOT NULL,
    is_correct TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_ans_attempt (attempt_id)
) ENGINE=InnoDB;

-- 6. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chat_user (user_id)
) ENGINE=InnoDB;

-- ===================================================
-- SEED DATA
-- ===================================================

-- Clear existing data if re-running (safe order due to foreign keys)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE chat_messages;
TRUNCATE TABLE answers;
TRUNCATE TABLE attempts;
TRUNCATE TABLE questions;
TRUNCATE TABLE quizzes;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users (Admin + 3 Students)
-- Admin: admin@quizsystem.com / Admin@123
-- Students: student1@quizsystem.com, student2@quizsystem.com, student3@quizsystem.com / Student@123
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'System Administrator', 'admin@quizsystem.com', 'scrypt:32768:8:1$613cl4RVzoJfC1HK$4417812a0da4c00d7ceb0aecfbf89624599904ecc46ef8f34e4b689d276c532326a3efadc27768ffbc177d6b6f251a78653a64fa37e16ef688d952138e50c3ce', 'admin'),
(2, 'Alex Johnson', 'student1@quizsystem.com', 'scrypt:32768:8:1$d5bXKXlvHdlh9Hou$ea4b9d0c31f5c3fe2d2eccfa46548d8101ed18d6e8bc54e95899b9a2382ca2955badfe5e1dd37903ed19879338f7f28050fcfad43d29a5ce6ef849686c64c077', 'student'),
(3, 'Maria Garcia', 'student2@quizsystem.com', 'scrypt:32768:8:1$d5bXKXlvHdlh9Hou$ea4b9d0c31f5c3fe2d2eccfa46548d8101ed18d6e8bc54e95899b9a2382ca2955badfe5e1dd37903ed19879338f7f28050fcfad43d29a5ce6ef849686c64c077', 'student'),
(4, 'David Kim', 'student3@quizsystem.com', 'scrypt:32768:8:1$d5bXKXlvHdlh9Hou$ea4b9d0c31f5c3fe2d2eccfa46548d8101ed18d6e8bc54e95899b9a2382ca2955badfe5e1dd37903ed19879338f7f28050fcfad43d29a5ce6ef849686c64c077', 'student');

-- 2. Insert Quizzes
INSERT INTO quizzes (id, title, description, category, difficulty, time_limit, total_questions, status) VALUES
(1, 'Python Fundamentals', 'Test your knowledge of core Python concepts including data types, functions, list comprehensions, and OOP basics.', 'Python', 'easy', 10, 6, 'published'),
(2, 'Database Management Systems', 'Evaluate your DBMS concepts covering SQL queries, normalization, ACID properties, indexing, and joins.', 'Database', 'medium', 15, 6, 'published'),
(3, 'Web Development Basics', 'Core concepts of modern web technologies including HTML5 semantics, CSS Flexbox/Grid, and modern JavaScript ES6+.', 'Web Development', 'easy', 10, 6, 'published');

-- 3. Insert Questions
-- Quiz 1: Python Fundamentals (6 questions)
INSERT INTO questions (id, quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, marks) VALUES
(1, 1, 'Which of the following data types in Python is immutable?', 'List', 'Dictionary', 'Set', 'Tuple', 'D', 1),
(2, 1, 'What is the output of print(type([]) is list)?', 'False', 'True', 'None', 'Error', 'B', 1),
(3, 1, 'Which keyword is used to define a function in Python?', 'func', 'function', 'def', 'define', 'C', 1),
(4, 1, 'What does the method .strip() do to a Python string?', 'Splits the string into a list', 'Removes leading and trailing whitespace', 'Converts all characters to lowercase', 'Reverses the string characters', 'B', 1),
(5, 1, 'Which collection does NOT allow duplicate elements?', 'List', 'Tuple', 'Set', 'OrderedDict', 'C', 1),
(6, 1, 'What is the correct syntax for a list comprehension generating squares of 0 to 4?', '[x*2 for x in range(5)]', '[x**2 for x in range(5)]', '[x^2 in range(5)]', 'for x in range(5): x**2', 'B', 1);

-- Quiz 2: Database Management Systems (6 questions)
INSERT INTO questions (id, quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, marks) VALUES
(7, 2, 'What does the "A" in ACID properties stand for?', 'Accuracy', 'Atomicity', 'Availability', 'Authentication', 'B', 1),
(8, 2, 'Which SQL clause is used to filter records after an aggregate GROUP BY operation?', 'WHERE', 'ORDER BY', 'HAVING', 'FILTER', 'C', 1),
(9, 2, 'A table is in 2NF if it is in 1NF and what condition is met?', 'No transitive dependencies', 'No partial functional dependencies', 'No multi-valued dependencies', 'Contains a surrogate primary key', 'B', 1),
(10, 2, 'Which SQL command is used to permanently remove all rows from a table quickly without logging individual row deletions?', 'DELETE', 'DROP', 'REMOVE', 'TRUNCATE', 'D', 1),
(11, 2, 'Which key uniquely identifies a record and CANNOT contain NULL values?', 'Foreign Key', 'Primary Key', 'Candidate Key', 'Composite Key with NULLs', 'B', 1),
(12, 2, 'What type of JOIN returns all records when there is a match in either left or right table?', 'INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'FULL OUTER JOIN', 'D', 1);

-- Quiz 3: Web Development Basics (6 questions)
INSERT INTO questions (id, quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, marks) VALUES
(13, 3, 'Which HTML5 element is used for the primary introductory navigation links?', '<nav>', '<section>', '<header>', '<aside>', 'A', 1),
(14, 3, 'In CSS Flexbox, which property aligns items along the cross axis?', 'justify-content', 'align-items', 'flex-direction', 'align-content', 'B', 1),
(15, 3, 'What will typeof NaN return in JavaScript?', 'number', 'NaN', 'undefined', 'object', 'A', 1),
(16, 3, 'Which HTTP status code signifies "Created" upon a successful POST request?', '200', '201', '204', '302', 'B', 1),
(17, 3, 'Which JavaScript declaration is block-scoped and cannot be reassigned?', 'var', 'let', 'const', 'static', 'C', 1),
(18, 3, 'What does the DOM stand for in web development?', 'Document Object Model', 'Data Oriented Module', 'Digital Ordinance Mode', 'Document Operating Mechanism', 'A', 1);

-- 4. Insert Sample Attempts (For statistics, history & leaderboard)
-- Alex Johnson (User 2) took Quiz 1 (Score: 6/6)
INSERT INTO attempts (id, user_id, quiz_id, score, total_marks, percentage, correct_answers, wrong_answers, unanswered, time_taken, attempted_at) VALUES
(1, 2, 1, 6, 6, 100.00, 6, 0, 0, 245, NOW() - INTERVAL 2 DAY),
-- Maria Garcia (User 3) took Quiz 1 (Score: 5/6)
(2, 3, 1, 5, 6, 83.33, 5, 1, 0, 310, NOW() - INTERVAL 1 DAY),
-- David Kim (User 4) took Quiz 1 (Score: 4/6)
(3, 4, 1, 4, 6, 66.67, 4, 2, 0, 420, NOW() - INTERVAL 12 HOUR),
-- Alex Johnson (User 2) took Quiz 2 (Score: 5/6)
(4, 2, 2, 5, 6, 83.33, 5, 1, 0, 480, NOW() - INTERVAL 6 HOUR);

-- 5. Insert Sample Answers for Attempt 1
INSERT INTO answers (attempt_id, question_id, selected_answer, correct_answer, is_correct) VALUES
(1, 1, 'D', 'D', 1),
(1, 2, 'B', 'B', 1),
(1, 3, 'C', 'C', 1),
(1, 4, 'B', 'B', 1),
(1, 5, 'C', 'C', 1),
(1, 6, 'B', 'B', 1);

-- Sample Answers for Attempt 2
INSERT INTO answers (attempt_id, question_id, selected_answer, correct_answer, is_correct) VALUES
(2, 1, 'D', 'D', 1),
(2, 2, 'B', 'B', 1),
(2, 3, 'C', 'C', 1),
(2, 4, 'B', 'B', 1),
(2, 5, 'A', 'C', 0),
(2, 6, 'B', 'B', 1);

-- 6. Insert Sample Chatbot Messages
INSERT INTO chat_messages (user_id, message, response, created_at) VALUES
(2, 'What is the difference between tuple and list in Python?', 'In Python, the primary difference is mutability. Lists are mutable (you can add, remove, or modify items using methods like .append() or index assignment), defined with square brackets []. Tuples are immutable (items cannot be changed after creation), defined with parentheses (). Tuples are typically faster and can be used as dictionary keys when their contents are hashable.', NOW() - INTERVAL 1 DAY),
(3, 'Can you explain 2NF and 3NF simply?', 'Sure! First Normal Form (1NF) ensures all columns contain atomic (indivisible) values with no repeating groups.\n- Second Normal Form (2NF): Must be in 1NF, and every non-key column must depend on the whole primary key (no partial functional dependencies).\n- Third Normal Form (3NF): Must be in 2NF, and no non-key column can depend on another non-key column (no transitive dependencies).', NOW() - INTERVAL 12 HOUR);
