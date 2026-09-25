from flask import Blueprint, request
from database import fetch_all
from utils.helpers import success_response

leaderboard_bp = Blueprint("leaderboard", __name__)

@leaderboard_bp.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    """
    Retrieve ranked student leaderboard.
    Ranking rule:
      1. Higher percentage / score first
      2. Faster time taken second
      3. Earlier attempt date third
    """
    quiz_id = request.args.get("quiz_id", "").strip()

    sql = """
        SELECT 
            u.name AS student_name,
            q.title AS quiz_title,
            q.category,
            a.score,
            a.total_marks,
            a.percentage,
            a.time_taken,
            a.attempted_at
        FROM attempts a
        JOIN users u ON a.user_id = u.id
        JOIN quizzes q ON a.quiz_id = q.id
        WHERE u.role = 'student'
    """
    params = []

    if quiz_id and quiz_id.lower() != "all":
        try:
            qid = int(quiz_id)
            sql += " AND a.quiz_id = %s"
            params.append(qid)
        except ValueError:
            pass

    sql += """
        ORDER BY a.percentage DESC, a.score DESC, a.time_taken ASC, a.attempted_at ASC
        LIMIT 50
    """

    results = fetch_all(sql, params)

    leaderboard = []
    for rank, row in enumerate(results, start=1):
        leaderboard.append({
            "rank": rank,
            "student_name": row["student_name"],
            "quiz_title": row["quiz_title"],
            "category": row["category"],
            "score": row["score"],
            "total_marks": row["total_marks"],
            "percentage": float(row["percentage"]),
            "time_taken": row["time_taken"],
            "attempted_at": row["attempted_at"].strftime("%Y-%m-%d") if row.get("attempted_at") else ""
        })

    # Available quizzes list for filter dropdown
    quizzes = fetch_all("SELECT id, title, category FROM quizzes WHERE status = 'published' ORDER BY title ASC")

    return success_response(data={
        "leaderboard": leaderboard,
        "quizzes": quizzes,
        "ranking_rule": "Ranked by highest percentage, then score, followed by fastest time taken."
    })
