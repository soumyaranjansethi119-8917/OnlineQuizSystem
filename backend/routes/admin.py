from flask import Blueprint, request
from database import fetch_one, fetch_all, execute_query, execute_insert
from utils.auth_utils import admin_required
from utils.helpers import success_response, error_response

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/statistics", methods=["GET"])
@admin_required
def get_statistics(current_user):
    """Return platform statistics, metrics, and chart datasets for admin dashboard."""
    # Summary Cards
    students_count = fetch_one("SELECT COUNT(id) AS total FROM users WHERE role = 'student'")["total"]
    quizzes_count = fetch_one("SELECT COUNT(id) AS total FROM quizzes")["total"]
    questions_count = fetch_one("SELECT COUNT(id) AS total FROM questions")["total"]
    attempts_count = fetch_one("SELECT COUNT(id) AS total FROM attempts")["total"]
    
    avg_score_res = fetch_one("SELECT COALESCE(ROUND(AVG(percentage), 1), 0) AS avg_score FROM attempts")
    avg_score = float(avg_score_res["avg_score"]) if avg_score_res else 0.0

    # 1. Chart Data: Quiz Popularity (Attempts per quiz)
    popularity = fetch_all("""
        SELECT q.title, COUNT(a.id) AS count
        FROM quizzes q
        LEFT JOIN attempts a ON q.id = a.quiz_id
        GROUP BY q.id, q.title
        ORDER BY count DESC
        LIMIT 6
    """)

    # 2. Chart Data: Student Performance Distribution (Grade ranges)
    performance = fetch_all("""
        SELECT 
            SUM(CASE WHEN percentage >= 80 THEN 1 ELSE 0 END) AS excellent,
            SUM(CASE WHEN percentage >= 60 AND percentage < 80 THEN 1 ELSE 0 END) AS good,
            SUM(CASE WHEN percentage >= 40 AND percentage < 60 THEN 1 ELSE 0 END) AS average,
            SUM(CASE WHEN percentage < 40 THEN 1 ELSE 0 END) AS needs_improvement
        FROM attempts
    """)
    perf_data = performance[0] if performance else {"excellent": 0, "good": 0, "average": 0, "needs_improvement": 0}

    # 3. Chart Data: Attempts Over Time (Recent 7 days)
    attempts_over_time = fetch_all("""
        SELECT DATE_FORMAT(attempted_at, '%b %d') AS date_label, COUNT(id) AS attempts
        FROM attempts
        WHERE attempted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE_FORMAT(attempted_at, '%b %d'), DATE(attempted_at)
        ORDER BY DATE(attempted_at) ASC
    """)

    # Recent attempts (for dashboard table)
    recent_attempts = fetch_all("""
        SELECT 
            a.id, u.name AS student_name, u.email AS student_email,
            q.title AS quiz_title, a.score, a.total_marks, a.percentage,
            a.attempted_at
        FROM attempts a
        JOIN users u ON a.user_id = u.id
        JOIN quizzes q ON a.quiz_id = q.id
        ORDER BY a.attempted_at DESC
        LIMIT 6
    """)
    for att in recent_attempts:
        if att.get("attempted_at"):
            att["attempted_at"] = att["attempted_at"].strftime("%Y-%m-%d %H:%M")

    # Recent quizzes
    recent_quizzes = fetch_all("""
        SELECT id, title, category, difficulty, total_questions, status, created_at
        FROM quizzes
        ORDER BY created_at DESC
        LIMIT 5
    """)
    for q in recent_quizzes:
        if q.get("created_at"):
            q["created_at"] = q["created_at"].strftime("%Y-%m-%d")

    return success_response(data={
        "summary": {
            "total_students": students_count,
            "total_quizzes": quizzes_count,
            "total_questions": questions_count,
            "total_attempts": attempts_count,
            "average_score": avg_score
        },
        "charts": {
            "popularity": popularity,
            "performance": perf_data,
            "attempts_over_time": attempts_over_time
        },
        "recent_attempts": recent_attempts,
        "recent_quizzes": recent_quizzes
    })

@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_users(current_user):
    """Return all registered students with aggregate performance statistics."""
    users = fetch_all("""
        SELECT 
            u.id, u.name, u.email, u.role, u.created_at,
            COUNT(a.id) AS total_attempts,
            COALESCE(ROUND(AVG(a.percentage), 1), 0) AS avg_percentage,
            COALESCE(MAX(a.score), 0) AS highest_score
        FROM users u
        LEFT JOIN attempts a ON u.id = a.user_id
        WHERE u.role = 'student'
        GROUP BY u.id, u.name, u.email, u.role, u.created_at
        ORDER BY u.created_at DESC
    """)
    for u in users:
        if u.get("created_at"):
            u["created_at"] = u["created_at"].strftime("%Y-%m-%d %H:%M")
    return success_response(data=users)

# ==================== QUIZ CRUD ====================

@admin_bp.route("/quizzes", methods=["GET"])
@admin_required
def get_all_quizzes(current_user):
    """Get all quizzes for administrative management."""
    quizzes = fetch_all("""
        SELECT 
            q.id, q.title, q.description, q.category, q.difficulty,
            q.time_limit, q.status, q.created_at, q.updated_at,
            COUNT(ques.id) AS total_questions
        FROM quizzes q
        LEFT JOIN questions ques ON q.id = ques.quiz_id
        GROUP BY q.id
        ORDER BY q.created_at DESC
    """)
    for q in quizzes:
        if q.get("created_at"):
            q["created_at"] = q["created_at"].strftime("%Y-%m-%d %H:%M")
        if q.get("updated_at"):
            q["updated_at"] = q["updated_at"].strftime("%Y-%m-%d %H:%M")
    return success_response(data=quizzes)

@admin_bp.route("/quizzes", methods=["POST"])
@admin_required
def create_quiz(current_user):
    """Create a new quiz."""
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    category = (data.get("category") or "").strip()
    difficulty = (data.get("difficulty") or "medium").lower()
    time_limit = data.get("time_limit")
    status = (data.get("status") or "published").lower()

    if not title:
        return error_response("Quiz title is required", 400)
    if not category:
        return error_response("Quiz category is required", 400)
    try:
        time_limit = int(time_limit)
        if time_limit <= 0:
            return error_response("Time limit must be greater than 0 minutes", 400)
    except (TypeError, ValueError):
        return error_response("Valid time limit in minutes is required", 400)

    if difficulty not in ["easy", "medium", "hard"]:
        difficulty = "medium"
    if status not in ["draft", "published", "inactive"]:
        status = "published"

    quiz_id = execute_insert("""
        INSERT INTO quizzes (title, description, category, difficulty, time_limit, status)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (title, description, category, difficulty, time_limit, status))

    return success_response(data={"id": quiz_id}, message="Quiz created successfully!", status_code=201)

@admin_bp.route("/quizzes/<int:quiz_id>", methods=["GET"])
@admin_required
def get_quiz_details(current_user, quiz_id):
    """Get single quiz details for editing."""
    quiz = fetch_one("SELECT * FROM quizzes WHERE id = %s", (quiz_id,))
    if not quiz:
        return error_response("Quiz not found", 404)
    return success_response(data=quiz)

@admin_bp.route("/quizzes/<int:quiz_id>", methods=["PUT"])
@admin_required
def update_quiz(current_user, quiz_id):
    """Update quiz metadata."""
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    category = (data.get("category") or "").strip()
    difficulty = (data.get("difficulty") or "medium").lower()
    time_limit = data.get("time_limit")
    status = (data.get("status") or "published").lower()

    if not title:
        return error_response("Quiz title is required", 400)
    if not category:
        return error_response("Quiz category is required", 400)
    try:
        time_limit = int(time_limit)
        if time_limit <= 0:
            return error_response("Time limit must be positive", 400)
    except (TypeError, ValueError):
        return error_response("Time limit must be an integer", 400)

    existing = fetch_one("SELECT id FROM quizzes WHERE id = %s", (quiz_id,))
    if not existing:
        return error_response("Quiz not found", 404)

    execute_query("""
        UPDATE quizzes
        SET title = %s, description = %s, category = %s, difficulty = %s, time_limit = %s, status = %s
        WHERE id = %s
    """, (title, description, category, difficulty, time_limit, status, quiz_id))

    return success_response(message="Quiz updated successfully!")

@admin_bp.route("/quizzes/<int:quiz_id>/status", methods=["PATCH"])
@admin_required
def toggle_quiz_status(current_user, quiz_id):
    """Toggle or update quiz status (published/inactive/draft)."""
    data = request.get_json() or {}
    new_status = data.get("status")
    if not new_status or new_status not in ["published", "inactive", "draft"]:
        return error_response("Invalid status value", 400)

    affected = execute_query("UPDATE quizzes SET status = %s WHERE id = %s", (new_status, quiz_id))
    if not affected:
        return error_response("Quiz not found", 404)

    return success_response(message=f"Quiz status updated to '{new_status}'")

@admin_bp.route("/quizzes/<int:quiz_id>", methods=["DELETE"])
@admin_required
def delete_quiz(current_user, quiz_id):
    """Delete a quiz and its questions/attempts cascadingly."""
    affected = execute_query("DELETE FROM quizzes WHERE id = %s", (quiz_id,))
    if not affected:
        return error_response("Quiz not found", 404)
    return success_response(message="Quiz deleted successfully")

# ==================== QUESTION CRUD ====================

@admin_bp.route("/quizzes/<int:quiz_id>/questions", methods=["GET"])
@admin_required
def get_quiz_questions(current_user, quiz_id):
    """Get all questions for a specific quiz, including correct answers (admin only)."""
    quiz = fetch_one("SELECT id, title FROM quizzes WHERE id = %s", (quiz_id,))
    if not quiz:
        return error_response("Quiz not found", 404)

    questions = fetch_all("""
        SELECT id, quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, marks
        FROM questions
        WHERE quiz_id = %s
        ORDER BY id ASC
    """, (quiz_id,))

    return success_response(data={"quiz": quiz, "questions": questions})

@admin_bp.route("/quizzes/<int:quiz_id>/questions", methods=["POST"])
@admin_required
def add_question_to_quiz(current_user, quiz_id):
    """Add a question to a specific quiz."""
    data = request.get_json() or {}
    question_text = (data.get("question") or "").strip()
    option_a = (data.get("option_a") or "").strip()
    option_b = (data.get("option_b") or "").strip()
    option_c = (data.get("option_c") or "").strip()
    option_d = (data.get("option_d") or "").strip()
    correct_answer = (data.get("correct_answer") or "").strip().upper()
    marks = data.get("marks", 1)

    if not question_text:
        return error_response("Question text is required", 400)
    if not option_a or not option_b or not option_c or not option_d:
        return error_response("All 4 options (A, B, C, D) are required", 400)
    if correct_answer not in ["A", "B", "C", "D"]:
        return error_response("Correct answer must be one of 'A', 'B', 'C', or 'D'", 400)

    try:
        marks = int(marks)
        if marks <= 0:
            marks = 1
    except (TypeError, ValueError):
        marks = 1

    # Verify quiz exists
    quiz = fetch_one("SELECT id FROM quizzes WHERE id = %s", (quiz_id,))
    if not quiz:
        return error_response("Quiz not found", 404)

    qid = execute_insert("""
        INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, marks)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks))

    # Update total_questions on quiz table
    execute_query("""
        UPDATE quizzes 
        SET total_questions = (SELECT COUNT(id) FROM questions WHERE quiz_id = %s)
        WHERE id = %s
    """, (quiz_id, quiz_id))

    return success_response(data={"id": qid}, message="Question added successfully!", status_code=201)

@admin_bp.route("/questions/<int:question_id>", methods=["GET"])
@admin_required
def get_single_question(current_user, question_id):
    """Fetch details of a single question."""
    q = fetch_one("SELECT * FROM questions WHERE id = %s", (question_id,))
    if not q:
        return error_response("Question not found", 404)
    return success_response(data=q)

@admin_bp.route("/questions/<int:question_id>", methods=["PUT"])
@admin_required
def update_question(current_user, question_id):
    """Update question content, options, correct answer, or marks."""
    data = request.get_json() or {}
    question_text = (data.get("question") or "").strip()
    option_a = (data.get("option_a") or "").strip()
    option_b = (data.get("option_b") or "").strip()
    option_c = (data.get("option_c") or "").strip()
    option_d = (data.get("option_d") or "").strip()
    correct_answer = (data.get("correct_answer") or "").strip().upper()
    marks = data.get("marks", 1)

    if not question_text:
        return error_response("Question text is required", 400)
    if not option_a or not option_b or not option_c or not option_d:
        return error_response("All 4 options (A, B, C, D) are required", 400)
    if correct_answer not in ["A", "B", "C", "D"]:
        return error_response("Correct answer must be one of 'A', 'B', 'C', or 'D'", 400)

    try:
        marks = int(marks)
        if marks <= 0:
            marks = 1
    except (TypeError, ValueError):
        marks = 1

    existing = fetch_one("SELECT id, quiz_id FROM questions WHERE id = %s", (question_id,))
    if not existing:
        return error_response("Question not found", 404)

    execute_query("""
        UPDATE questions
        SET question = %s, option_a = %s, option_b = %s, option_c = %s, option_d = %s, correct_answer = %s, marks = %s
        WHERE id = %s
    """, (question_text, option_a, option_b, option_c, option_d, correct_answer, marks, question_id))

    return success_response(message="Question updated successfully!")

@admin_bp.route("/questions/<int:question_id>", methods=["DELETE"])
@admin_required
def delete_question(current_user, question_id):
    """Delete a question and update quiz total_questions count."""
    existing = fetch_one("SELECT id, quiz_id FROM questions WHERE id = %s", (question_id,))
    if not existing:
        return error_response("Question not found", 404)

    quiz_id = existing["quiz_id"]
    execute_query("DELETE FROM questions WHERE id = %s", (question_id,))

    # Update quiz question count
    execute_query("""
        UPDATE quizzes 
        SET total_questions = (SELECT COUNT(id) FROM questions WHERE quiz_id = %s)
        WHERE id = %s
    """, (quiz_id, quiz_id))

    return success_response(message="Question deleted successfully")
