from flask import Blueprint
from database import fetch_all, fetch_one
from utils.auth_utils import token_required
from utils.helpers import success_response, error_response

questions_bp = Blueprint("questions", __name__)

@questions_bp.route("/quizzes/<int:quiz_id>/questions", methods=["GET"])
@token_required
def get_quiz_questions_for_taking(current_user, quiz_id):
    """
    Fetch questions for a student taking a quiz.
    CRITICAL SECURITY FEATURE:
    'correct_answer' is STRICTLY EXCLUDED to prevent client-side inspection.
    """
    # Check that the quiz exists and is published
    quiz = fetch_one("""
        SELECT id, title, description, category, difficulty, time_limit
        FROM quizzes
        WHERE id = %s AND status = 'published'
    """, (quiz_id,))

    if not quiz:
        return error_response("Quiz not found or is currently unavailable", 404)

    # Fetch questions without correct_answer column
    questions = fetch_all("""
        SELECT id, quiz_id, question, option_a, option_b, option_c, option_d, marks
        FROM questions
        WHERE quiz_id = %s
        ORDER BY id ASC
    """, (quiz_id,))

    if not questions:
        return error_response("This quiz currently has no questions available", 400)

    total_marks = sum(q.get("marks", 1) for q in questions)

    return success_response(data={
        "quiz": quiz,
        "total_questions": len(questions),
        "total_marks": total_marks,
        "questions": questions
    })
