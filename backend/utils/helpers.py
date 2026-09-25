import re
from flask import jsonify

def success_response(data=None, message="Operation successful", status_code=200):
    """Format and return a standardized JSON success response."""
    payload = {
        "success": True,
        "message": message,
        "data": data if data is not None else {}
    }
    return jsonify(payload), status_code

def error_response(message="An error occurred", status_code=400, errors=None):
    """Format and return a standardized JSON error response."""
    payload = {
        "success": False,
        "message": message
    }
    if errors is not None:
        payload["errors"] = errors
    return jsonify(payload), status_code

def is_valid_email(email):
    """Validate email address format using regular expression."""
    if not email or not isinstance(email, str):
        return False
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email.strip()))

def format_seconds(seconds):
    """Convert integer seconds to MM:SS string."""
    if not seconds or seconds < 0:
        return "00:00"
    m, s = divmod(int(seconds), 60)
    return f"{m:02d}:{s:02d}"
