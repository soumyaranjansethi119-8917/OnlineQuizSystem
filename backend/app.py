from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from utils.helpers import error_response

# Import Blueprints
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.quiz import quiz_bp
from routes.questions import questions_bp
from routes.attempts import attempts_bp
from routes.leaderboard import leaderboard_bp
from routes.chatbot import chatbot_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for React frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(quiz_bp, url_prefix="/api")
    app.register_blueprint(questions_bp, url_prefix="/api")
    app.register_blueprint(attempts_bp, url_prefix="/api")
    app.register_blueprint(leaderboard_bp, url_prefix="/api")
    app.register_blueprint(chatbot_bp, url_prefix="/api")

    # Root Health Check
    @app.route("/", methods=["GET"])
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "success": True,
            "message": "Online Quiz System REST API is live and operational",
            "version": "1.0.0",
            "environment": Config.FLASK_ENV
        })

    # Global Error Handlers returning friendly JSON responses
    @app.errorhandler(400)
    def bad_request(e):
        return error_response(str(e.description) if hasattr(e, 'description') else "Bad request", 400)

    @app.errorhandler(401)
    def unauthorized(e):
        return error_response("Authentication required", 401)

    @app.errorhandler(403)
    def forbidden(e):
        return error_response("Access forbidden", 403)

    @app.errorhandler(404)
    def not_found(e):
        return error_response("Endpoint or resource not found", 404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response("HTTP method not allowed for this endpoint", 405)

    from database import DatabaseError

    @app.errorhandler(DatabaseError)
    def database_error(e):
        return error_response(str(e), 503)

    @app.errorhandler(500)
    def internal_error(e):
        return error_response("Internal server error. Please try again later.", 500)

    return app

app = create_app()

if __name__ == "__main__":
    print(f"Starting Online Quiz System Flask server on http://127.0.0.1:{Config.PORT}")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
