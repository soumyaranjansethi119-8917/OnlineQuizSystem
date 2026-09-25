from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash
from database import fetch_one, execute_insert, execute_query
from utils.auth_utils import generate_token, token_required
from utils.helpers import success_response, error_response, is_valid_email

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new student account."""
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""

    # Required fields validation
    if not name:
        return error_response("Name is required", 400)
    if not email:
        return error_response("Email is required", 400)
    if not password:
        return error_response("Password is required", 400)
    if not confirm_password:
        return error_response("Password confirmation is required", 400)

    # Format and strength validation
    if not is_valid_email(email):
        return error_response("Please enter a valid email address", 400)
    if len(password) < 6:
        return error_response("Password must be at least 6 characters long", 400)
    if password != confirm_password:
        return error_response("Passwords do not match", 400)

    # Check for duplicate email
    existing_user = fetch_one("SELECT id FROM users WHERE email = %s", (email,))
    if existing_user:
        return error_response("An account with this email already exists", 409)

    # Hash password and insert
    hashed_pwd = generate_password_hash(password)
    try:
        user_id = execute_insert(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, 'student')",
            (name, email, hashed_pwd)
        )
        return success_response(
            data={"id": user_id, "name": name, "email": email, "role": "student"},
            message="Account created successfully! Please log in.",
            status_code=201
        )
    except Exception as e:
        return error_response(f"Database error during registration: {str(e)}", 500)

@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user with email and password, return JWT token and role."""
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return error_response("Email and password are required", 400)

    user = fetch_one("SELECT id, name, email, password, role, created_at FROM users WHERE email = %s", (email,))
    if not user or not check_password_hash(user["password"], password):
        return error_response("Invalid email or password", 401)

    # Generate JWT token
    token = generate_token(user)

    user_info = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"].strftime("%Y-%m-%d %H:%M:%S") if user.get("created_at") else None
    }

    return success_response(
        data={"token": token, "user": user_info},
        message=f"Welcome back, {user['name']}!"
    )

@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Logout endpoint for client confirmation."""
    return success_response(message="Logged out successfully")

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user):
    """Return profile details and statistics for current authenticated user."""
    # Compute quick stats
    user_id = current_user["id"]
    stats = fetch_one("""
        SELECT 
            COUNT(id) AS total_attempts,
            COALESCE(ROUND(AVG(percentage), 1), 0) AS average_score,
            COALESCE(MAX(score), 0) AS highest_score,
            COALESCE(SUM(correct_answers + wrong_answers), 0) AS total_questions_answered
        FROM attempts
        WHERE user_id = %s
    """, (user_id,))

    # Compute current leaderboard rank
    rank_res = fetch_one("""
        SELECT COUNT(*) + 1 AS user_rank
        FROM attempts
        WHERE score > (
            SELECT COALESCE(MAX(score), -1) FROM attempts WHERE user_id = %s
        )
    """, (user_id,))
    user_rank = rank_res["user_rank"] if rank_res and stats and stats["total_attempts"] > 0 else None

    profile_stats = {
        "total_attempts": stats["total_attempts"] if stats else 0,
        "average_score": float(stats["average_score"]) if stats else 0.0,
        "highest_score": stats["highest_score"] if stats else 0,
        "total_questions_answered": int(stats["total_questions_answered"]) if stats else 0,
        "rank": user_rank
    }

    profile_data = {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "created_at": current_user["created_at"].strftime("%Y-%m-%d %H:%M:%S") if current_user.get("created_at") else None,
        "stats": profile_stats
    }
    return success_response(data=profile_data)

@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile(current_user):
    """Update profile name for current user."""
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()

    if not name:
        return error_response("Name cannot be empty", 400)

    execute_query("UPDATE users SET name = %s WHERE id = %s", (name, current_user["id"]))
    updated_user = fetch_one("SELECT id, name, email, role FROM users WHERE id = %s", (current_user["id"],))
    return success_response(data=updated_user, message="Profile updated successfully")

@auth_bp.route("/change-password", methods=["PUT"])
@token_required
def change_password(current_user):
    """Update user password with current password verification."""
    data = request.get_json() or {}
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""
    confirm_new_password = data.get("confirm_new_password") or ""

    if not current_password or not new_password:
        return error_response("Current and new passwords are required", 400)
    if len(new_password) < 6:
        return error_response("New password must be at least 6 characters", 400)
    if new_password != confirm_new_password:
        return error_response("New passwords do not match", 400)

    # Verify existing password
    user_record = fetch_one("SELECT password FROM users WHERE id = %s", (current_user["id"],))
    if not user_record or not check_password_hash(user_record["password"], current_password):
        return error_response("Incorrect current password", 400)

    new_hash = generate_password_hash(new_password)
    execute_query("UPDATE users SET password = %s WHERE id = %s", (new_hash, current_user["id"]))
    return success_response(message="Password changed successfully")
