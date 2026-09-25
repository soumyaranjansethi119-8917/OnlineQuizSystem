import re
import requests
from flask import Blueprint, request
from config import Config
from database import fetch_all, execute_insert, execute_query
from utils.auth_utils import token_required
from utils.helpers import success_response, error_response

chatbot_bp = Blueprint("chatbot", __name__)

def generate_educational_fallback(prompt):
    """
    Intelligent built-in Computer Science, Database, and Web Development tutor.
    Provides accurate, well-explained educational responses when an external API key
    is not configured or when an external API request encounters a timeout/quota limit.
    """
    p = prompt.lower().strip()

    # Database / DBMS Concepts
    if "acid" in p:
        return (
            "ACID properties ensure reliable database transactions:\n"
            "• Atomicity: Entire transaction succeeds or completely rolls back ('all or nothing').\n"
            "• Consistency: Database transitions from one valid state to another, maintaining all constraints.\n"
            "• Isolation: Concurrent transactions execute without interfering with one another.\n"
            "• Durability: Once committed, data persists even in the event of a system crash."
        )
    if "normal" in p or "2nf" in p or "3nf" in p or "bcnf" in p:
        return (
            "Normalization organizes database tables to reduce redundancy and improve data integrity:\n"
            "• 1NF: All columns must contain atomic (indivisible) values, and each record must be unique.\n"
            "• 2NF: Meets 1NF + no partial dependency (all non-key attributes depend on the entire primary key).\n"
            "• 3NF: Meets 2NF + no transitive dependency (non-key attributes depend only on the primary key).\n"
            "• BCNF: Stricter version of 3NF where every determinant must be a candidate key."
        )
    if "primary key" in p or "foreign key" in p:
        return (
            "Keys in Relational Databases:\n"
            "• Primary Key: A unique identifier for every record in a table. It cannot contain NULL values.\n"
            "• Foreign Key: A column (or set of columns) that references the Primary Key of another table, establishing a relationship and enforcing referential integrity."
        )
    if "join" in p:
        return (
            "SQL Joins combine rows from two or more tables:\n"
            "• INNER JOIN: Returns records that have matching values in both tables.\n"
            "• LEFT JOIN: Returns all records from the left table, and matched records from the right table.\n"
            "• RIGHT JOIN: Returns all records from the right table, and matched records from the left table.\n"
            "• FULL OUTER JOIN: Returns all records when there is a match in either left or right table."
        )

    # Python Concepts
    if "tuple" in p and "list" in p:
        return (
            "Key differences between Lists and Tuples in Python:\n"
            "1. Mutability: Lists are mutable (items can be added, modified, or removed). Tuples are immutable.\n"
            "2. Syntax: Lists use square brackets `[1, 2, 3]`, while tuples use parentheses `(1, 2, 3)`.\n"
            "3. Performance: Tuples are slightly faster and consume less memory.\n"
            "4. Use Cases: Tuples are ideal for fixed constants and dictionary keys; lists are ideal for dynamic collections."
        )
    if "immutable" in p or "mutable" in p:
        return (
            "In Python:\n"
            "• Immutable types cannot be modified after creation: int, float, str, tuple, frozenset, bytes.\n"
            "• Mutable types can be altered in-place: list, dict, set, bytearray."
        )
    if "lambda" in p:
        return (
            "In Python, a `lambda` function is a small anonymous function defined without a name.\n"
            "Syntax: `lambda arguments: expression`\n"
            "Example: `square = lambda x: x ** 2`\n"
            "It can take any number of arguments, but can only have one expression."
        )
    if "oop" in p or "object oriented" in p:
        return (
            "The 4 pillars of Object-Oriented Programming (OOP):\n"
            "1. Encapsulation: Bundling data and methods that operate on that data within a single class.\n"
            "2. Abstraction: Hiding internal implementation details and exposing only essential interfaces.\n"
            "3. Inheritance: Deriving new classes from existing classes to promote code reuse.\n"
            "4. Polymorphism: Allowing entities to take on different forms (e.g. method overriding/overloading)."
        )

    # Web Development Concepts
    if "dom" in p:
        return (
            "DOM stands for Document Object Model. It is a language-independent programming interface "
            "that represents an HTML or XML document as a tree structure of objects. JavaScript uses the "
            "DOM to inspect, manipulate, add, or delete HTML elements dynamically."
        )
    if "flexbox" in p or "grid" in p:
        return (
            "CSS Layout Systems:\n"
            "• Flexbox (Flexible Box): One-dimensional layout model (either row OR column). Ideal for aligning items and distributing space in a navigation bar or card deck.\n"
            "• CSS Grid: Two-dimensional layout model (rows AND columns simultaneously). Ideal for page layouts and complex responsive structures."
        )
    if "status code" in p or "http" in p:
        return (
            "Standard HTTP Status Code Categories:\n"
            "• 2xx Success: 200 OK, 201 Created, 204 No Content\n"
            "• 3xx Redirection: 301 Moved Permanently, 304 Not Modified\n"
            "• 4xx Client Error: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict\n"
            "• 5xx Server Error: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable"
        )
    if "rest" in p or "api" in p:
        return (
            "REST (Representational State Transfer) is an architectural style for networked applications.\n"
            "Core principles:\n"
            "1. Statelessness: Each request from client to server must contain all necessary information.\n"
            "2. Standard HTTP Verbs: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove).\n"
            "3. Resource-Based URLs: e.g. `/api/quizzes`, `/api/quizzes/1/questions`.\n"
            "4. Standard Representations: JSON data payloads."
        )

    # General Academic / Quiz preparation greeting
    return (
        f"That's a great question about '{prompt.strip()}'!\n"
        "Here is a key educational overview:\n"
        "1. Understand the core definitions, fundamental syntax, and architectural concepts.\n"
        "2. Review how related components interact (e.g. client-server, relational tables, or OOP objects).\n"
        "3. Test your understanding by taking our practice quizzes in the Quizzes section.\n"
        "Feel free to ask me for specific examples in Python, SQL, DBMS, or Web Development!"
    )

@chatbot_bp.route("/chat", methods=["POST"])
@token_required
def send_chat_message(current_user):
    """Process student message via AI API or educational fallback, persist in MySQL."""
    data = request.get_json() or {}
    message = (data.get("message") or "").strip()

    if not message:
        return error_response("Please enter a question or message", 400)

    ai_response_text = None

    # Check if an external AI API key is configured
    api_key = Config.AI_API_KEY.strip()
    if api_key:
        try:
            # Call Google Gemini REST API
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": (
                                    "You are an expert, encouraging, and clear Computer Science and Academic Quiz tutor. "
                                    "Provide a structured, helpful, concise answer to this student question:\n"
                                    + message
                                )
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.5,
                    "maxOutputTokens": 450
                }
            }
            resp = requests.post(gemini_url, json=payload, timeout=8)
            if resp.status_code == 200:
                result_json = resp.json()
                candidates = result_json.get("candidates", [])
                if candidates:
                    ai_response_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        except Exception:
            # Fallback will take over gracefully
            ai_response_text = None

    # Use intelligent educational fallback if external API is unconfigured or failed
    if not ai_response_text:
        ai_response_text = generate_educational_fallback(message)

    # Save to chat_messages table
    try:
        execute_insert(
            "INSERT INTO chat_messages (user_id, message, response) VALUES (%s, %s, %s)",
            (current_user["id"], message, ai_response_text)
        )
    except Exception:
        pass

    return success_response(data={"message": message, "response": ai_response_text})

@chatbot_bp.route("/chat/history", methods=["GET"])
@token_required
def get_chat_history(current_user):
    """Retrieve chat history for the logged-in student."""
    history = fetch_all("""
        SELECT id, message, response, created_at
        FROM chat_messages
        WHERE user_id = %s
        ORDER BY created_at ASC
        LIMIT 50
    """, (current_user["id"],))

    for item in history:
        if item.get("created_at"):
            item["created_at"] = item["created_at"].strftime("%b %d, %H:%M")

    return success_response(data=history)

@chatbot_bp.route("/chat/history", methods=["DELETE"])
@token_required
def clear_chat_history(current_user):
    """Clear chat conversation history for current student."""
    execute_query("DELETE FROM chat_messages WHERE user_id = %s", (current_user["id"],))
    return success_response(message="Chat history cleared successfully")
