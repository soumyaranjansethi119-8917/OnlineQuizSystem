from flask import Blueprint, request
from database import fetch_all, fetch_one
from utils.helpers import success_response, error_response

quiz_bp = Blueprint("quiz", __name__)

@quiz_bp.route("/quizzes", methods=["GET"])
def get_available_quizzes():
    """Return published quizzes with optional search, category, and difficulty filters."""
    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()
    difficulty = request.args.get("difficulty", "").strip()

    sql = """
        SELECT 
            q.id, q.title, q.description, q.category, q.difficulty,
            q.time_limit, q.status, q.created_at,
            COUNT(ques.id) AS total_questions,
            COALESCE(SUM(ques.marks), 0) AS total_marks
        FROM quizzes q
        LEFT JOIN questions ques ON q.id = ques.quiz_id
        WHERE q.status = 'published'
    """
    params = []

    if search:
        sql += " AND (q.title LIKE %s OR q.description LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])

    if category and category.lower() != "all":
        sql += " AND q.category = %s"
        params.append(category)

    if difficulty and difficulty.lower() != "all":
        sql += " AND q.difficulty = %s"
        params.append(difficulty)

    sql += " GROUP BY q.id ORDER BY q.created_at DESC"

    quizzes = fetch_all(sql, params)
    for q in quizzes:
        if q.get("created_at"):
            q["created_at"] = q["created_at"].strftime("%Y-%m-%d")

    # Also return list of unique categories available for filter pills
    categories_res = fetch_all("SELECT DISTINCT category FROM quizzes WHERE status = 'published' ORDER BY category ASC")
    categories = [c["category"] for c in categories_res if c.get("category")]

    return success_response(data={
        "quizzes": quizzes,
        "categories": categories
    })

@quiz_bp.route("/quizzes/<int:quiz_id>", methods=["GET"])
def get_quiz_by_id(quiz_id):
    """Get metadata for a single published quiz (e.g. for quiz instructions page)."""
    quiz = fetch_one("""
        SELECT 
            q.id, q.title, q.description, q.category, q.difficulty,
            q.time_limit, q.status, q.created_at,
            COUNT(ques.id) AS total_questions,
            COALESCE(SUM(ques.marks), 0) AS total_marks
        FROM quizzes q
        LEFT JOIN questions ques ON q.id = ques.quiz_id
        WHERE q.id = %s AND q.status = 'published'
        GROUP BY q.id
    """, (quiz_id,))

    if not quiz:
        return error_response("Quiz not found or is currently unavailable", 404)

    if quiz.get("created_at"):
        quiz["created_at"] = quiz["created_at"].strftime("%Y-%m-%d")

    return success_response(data=quiz)

@quiz_bp.route("/public/stats", methods=["GET"])
def get_public_stats():
    """Return real platform overview statistics for landing page display."""
    quizzes_count = fetch_one("SELECT COUNT(id) AS total FROM quizzes WHERE status = 'published'")["total"]
    questions_count = fetch_one("""
        SELECT COUNT(ques.id) AS total 
        FROM questions ques
        JOIN quizzes q ON ques.quiz_id = q.id
        WHERE q.status = 'published'
    """)["total"]
    categories_count = fetch_one("SELECT COUNT(DISTINCT category) AS total FROM quizzes WHERE status = 'published'")["total"]
    attempts_count = fetch_one("SELECT COUNT(id) AS total FROM attempts")["total"]
    
    avg_score_res = fetch_one("SELECT COALESCE(ROUND(AVG(percentage), 1), 0) AS avg_score FROM attempts")
    avg_score = float(avg_score_res["avg_score"]) if avg_score_res else 0.0

    return success_response(data={
        "total_quizzes": quizzes_count,
        "total_questions": questions_count,
        "total_categories": categories_count,
        "total_attempts": attempts_count,
        "average_score": avg_score
    })

