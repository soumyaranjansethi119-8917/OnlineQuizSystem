"""
Database Initialization Script for Online Quiz System
Reads schema.sql and creates database, tables, and seed data in MySQL.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import pymysql

# Load .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "online_quiz_system")

def init_database():
    print("=" * 60)
    print("Online Quiz System - Database Initialization")
    print("=" * 60)
    print(f"Connecting to MySQL server at {DB_HOST}:{DB_PORT} as '{DB_USER}'...")

    try:
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            autocommit=True,
            charset='utf8mb4'
        )
        print("Connected to MySQL server successfully!")
    except Exception as e:
        print("\n[ERROR] Failed to connect to MySQL Server:")
        print(str(e))
        print("\nPlease ensure:")
        print("1. MySQL service is running (e.g., MySQL80 service).")
        print("2. The DB_PASSWORD in backend/.env matches your MySQL root password.")
        sys.exit(1)

    schema_file = Path(__file__).resolve().parent / "database" / "schema.sql"
    if not schema_file.exists():
        print(f"\n[ERROR] schema.sql not found at {schema_file}")
        sys.exit(1)

    print(f"Reading schema and seed data from: {schema_file}")
    with open(schema_file, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Split SQL script into statements while ignoring comments and empty lines
    statements = []
    current_stmt = []
    
    for line in sql_content.splitlines():
        trimmed = line.strip()
        if not trimmed or trimmed.startswith("--"):
            continue
        current_stmt.append(line)
        if trimmed.endswith(";"):
            stmt = "\n".join(current_stmt).strip()
            if stmt:
                statements.append(stmt)
            current_stmt = []

    print(f"Executing {len(statements)} SQL statements...")
    try:
        with connection.cursor() as cursor:
            for idx, stmt in enumerate(statements, start=1):
                try:
                    cursor.execute(stmt)
                except Exception as stmt_err:
                    print(f"\n[WARNING on statement {idx}]: {stmt_err}")
                    print(f"Statement preview: {stmt[:100]}...")
        print("\n[SUCCESS] Database 'online_quiz_system' initialized and seeded successfully!")
        print("Seed credentials:")
        print("  Admin:   admin@quizsystem.com   / Admin@123")
        print("  Student: student1@quizsystem.com / Student@123")
        print("=" * 60)
    except Exception as e:
        print(f"\n[ERROR] Failed during SQL execution: {e}")
        sys.exit(1)
    finally:
        connection.close()

if __name__ == "__main__":
    init_database()
