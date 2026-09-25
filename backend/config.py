import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of backend
BASE_DIR = Path(__file__).resolve().parent

# Load environment variables from .env
env_file = BASE_DIR / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file)

class Config:
    PORT = int(os.getenv("PORT", 5000))
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-quiz-system-2026")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = FLASK_ENV == "development"

    # MySQL Configuration
    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = int(os.getenv("DB_PORT", 3306))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "online_quiz_system")
    DB_SSL = os.getenv("DB_SSL", "false").lower() in ("true", "1", "yes")

    # AI API Configuration
    AI_API_KEY = os.getenv("AI_API_KEY", "")

    # JWT Configuration
    JWT_EXPIRATION_HOURS = 24
