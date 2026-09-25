from flask import Blueprint, request
from database import fetch_all, fetch_one, execute_insert
from utils.auth_utils import token_required
from utils.helpers import success_response, error_response

attempts_bp = Blueprint("attempts", __name__)

@attempts_bp.route("/submit-quiz", methods=["POST"])
@token_required
def submit_quiz(current_user):
    """
    Evaluate student's quiz answers against the database truth.
    Server-side scoring ensures accuracy and prevents tampering.
    """
    data = request.get_json() or {}
    quiz_id = data.get("quiz_id")
    time_taken = data.get("time_taken", 0)
    submitted_answers = data.get("answers", {})

    if not quiz_id:
        return error_response("Quiz ID is required", 400)

    try:
        time_taken = max(0, int(time_taken))
    except (TypeError, ValueError):
        time_taken = 0

    # Fetch all questions and correct answers from the database
    questions = fetch_all("""
        SELECT id, correct_answer, marks
        FROM questions
        WHERE quiz_id = %s
        ORDER BY id ASC
    """, (quiz_id,))

    if not questions:
        return error_response("Quiz questions could not be found for scoring", 400)

    total_marks = 0
    score = 0
    correct_count = 0
    wrong_count = 0
    unanswered_count = 0

    evaluated_answers = []

    for q in questions:
        qid = q["id"]
        q_marks = q.get("marks", 1)
        correct_ans = q["correct_answer"].strip().upper()
        total_marks += q_marks

        # Check what the student submitted (support both string and int keys)
        user_choice = submitted_answers.get(str(qid)) or submitted_answers.get(qid)

        if user_choice is not None and str(user_choice).strip() != "":
            user_choice = str(user_choice).strip().upper()
            if user_choice == correct_ans:
                correct_count += 1
                score += q_marks
                is_correct = 1
            else:
                wrong_count += 1
                is_correct = 0
        else:
            user_choice = None
            unanswered_count += 1
            is_correct = 0

        evaluated_answers.append({
            "question_id": qid,
            "selected_answer": user_choice,
            "correct_answer": correct_ans,
            "is_correct": is_correct
        })

    percentage = round((score / total_marks * 100), 2) if total_marks > 0 else 0.00

    # Insert attempt record
    attempt_id = execute_insert("""
        INSERT INTO attempts (
            user_id, quiz_id, score, total_marks, percentage,
            correct_answers, wrong_answers, unanswered, time_taken
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        current_user["id"], quiz_id, score, total_marks, percentage,
        correct_count, wrong_count, unanswered_count, time_taken
    ))

    # Insert individual answer records
    for ans in evaluated_answers:
        execute_insert("""
            INSERT INTO answers (attempt_id, question_id, selected_answer, correct_answer, is_correct)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            attempt_id, ans["question_id"], ans["selected_answer"],
            ans["correct_answer"], ans["is_correct"]
        ))

    return success_response(
        data={
            "attempt_id": attempt_id,
            "score": score,
            "total_marks": total_marks,
            "percentage": percentage,
            "correct_answers": correct_count,
            "wrong_answers": wrong_count,
            "unanswered": unanswered_count,
            "time_taken": time_taken,
            "passed": percentage >= 50.0
        },
        message="Quiz evaluated and saved successfully!",
        status_code=201
    )

@attempts_bp.route("/history", methods=["GET"])
@token_required
def get_user_history(current_user):
    """Retrieve all past quiz attempts for the logged-in student."""
    history = fetch_all("""
        SELECT 
            a.id, a.quiz_id, q.title AS quiz_title, q.category,
            a.score, a.total_marks, a.percentage,
            a.correct_answers, a.wrong_answers, a.unanswered,
            a.time_taken, a.attempted_at
        FROM attempts a
        JOIN quizzes q ON a.quiz_id = q.id
        WHERE a.user_id = %s
        ORDER BY a.attempted_at DESC
    """, (current_user["id"],))

    for item in history:
        if item.get("attempted_at"):
            item["attempted_at"] = item["attempted_at"].strftime("%Y-%m-%d %H:%M")

    return success_response(data=history)

@attempts_bp.route("/history/<int:attempt_id>", methods=["GET"])
@token_required
def get_attempt_detail(current_user, attempt_id):
    """
    Retrieve full attempt details and question-by-question review.
    Shows student's selected answer alongside the correct answer.
    """
    attempt = fetch_one("""
        SELECT 
            a.id, a.user_id, u.name AS student_name,
            a.quiz_id, q.title AS quiz_title, q.category, q.difficulty,
            a.score, a.total_marks, a.percentage,
            a.correct_answers, a.wrong_answers, a.unanswered,
            a.time_taken, a.attempted_at
        FROM attempts a
        JOIN users u ON a.user_id = u.id
        JOIN quizzes q ON a.quiz_id = q.id
        WHERE a.id = %s
    """, (attempt_id,))

    if not attempt:
        return error_response("Attempt not found", 404)

    # Permission check: students can only review their own attempts
    if current_user["role"] != "admin" and attempt["user_id"] != current_user["id"]:
        return error_response("Access forbidden: You may only review your own attempts", 403)

    if attempt.get("attempted_at"):
        attempt["attempted_at"] = attempt["attempted_at"].strftime("%Y-%m-%d %H:%M")

    # Fetch question reviews
    reviews = fetch_all("""
        SELECT 
            q.id AS question_id, q.question,
            q.option_a, q.option_b, q.option_c, q.option_d,
            q.marks,
            ans.selected_answer,
            ans.correct_answer,
            ans.is_correct
        FROM questions q
        JOIN answers ans ON q.id = ans.question_id
        WHERE ans.attempt_id = %s
        ORDER BY q.id ASC
    """, (attempt_id,))

    return success_response(data={
        "attempt": attempt,
        "questions": reviews
    })
