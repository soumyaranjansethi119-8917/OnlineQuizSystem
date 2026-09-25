import datetime
import jwt
from functools import wraps
from flask import request
from config import Config
from database import fetch_one
from utils.helpers import error_response

def generate_token(user):
    """Generate a JWT token for the authenticated user."""
    payload = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=Config.JWT_EXPIRATION_HOURS),
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")
    return token

def decode_token(token):
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require a valid JWT token for protected routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return error_response("Authentication token is missing", 401)

        parts = auth_header.split()
        if parts[0].lower() != "bearer" or len(parts) != 2:
            return error_response("Invalid authorization format. Expected 'Bearer <token>'", 401)

        token = parts[1]
        payload = decode_token(token)
        if not payload:
            return error_response("Token is invalid or has expired. Please log in again.", 401)

        # Confirm user exists in database
        user = fetch_one("SELECT id, name, email, role, created_at FROM users WHERE id = %s", (payload["id"],))
        if not user:
            return error_response("User associated with this token no longer exists", 401)

        return f(current_user=user, *args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator to require admin role."""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user.get("role") != "admin":
            return error_response("Access forbidden: Administrator privileges required", 403)
        return f(current_user=current_user, *args, **kwargs)
    return decorated

def student_required(f):
    """Decorator to require student role."""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user.get("role") != "student":
            return error_response("Access forbidden: Student privileges required", 403)
        return f(current_user=current_user, *args, **kwargs)
    return decorated
