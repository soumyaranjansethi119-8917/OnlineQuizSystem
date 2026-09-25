import pymysql
import pymysql.cursors
from contextlib import contextmanager
from config import Config

class DatabaseError(Exception):
    """Custom exception for database connection or operational failures."""
    pass

def get_connection():
    """Create and return a new MySQL connection with DictCursor."""
    try:
        return pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False,
            connect_timeout=3
        )
    except pymysql.OperationalError as e:
        code, msg = e.args if len(e.args) >= 2 else (0, str(e))
        if code == 1045:
            raise DatabaseError("Access denied for MySQL user 'root'. Please update DB_PASSWORD in backend/.env with your MySQL root password.")
        elif code == 1049:
            raise DatabaseError(f"Database '{Config.DB_NAME}' does not exist yet. Please run 'python init_db.py' or execute 'backend/database/schema.sql' in MySQL.")
        elif code == 2003:
            raise DatabaseError(f"Cannot connect to MySQL server at {Config.DB_HOST}:{Config.DB_PORT}. Please ensure MySQL service is running.")
        else:
            raise DatabaseError(f"MySQL Error ({code}): {msg}")
    except Exception as e:
        raise DatabaseError(f"Database connection error: {str(e)}")

@contextmanager
def get_db_cursor(commit=False):
    """Context manager for obtaining a database cursor with automatic transaction handling."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        yield cursor
        if commit:
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

def fetch_one(query, params=None):
    """Fetch a single record as a dictionary."""
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query, params or ())
        return cursor.fetchone()

def fetch_all(query, params=None):
    """Fetch all matching records as a list of dictionaries."""
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query, params or ())
        return cursor.fetchall()

def execute_query(query, params=None):
    """Execute an INSERT/UPDATE/DELETE statement and commit. Returns affected rows."""
    with get_db_cursor(commit=True) as cursor:
        affected = cursor.execute(query, params or ())
        return affected

def execute_insert(query, params=None):
    """Execute an INSERT statement and commit. Returns the last inserted ID."""
    with get_db_cursor(commit=True) as cursor:
        cursor.execute(query, params or ())
        return cursor.lastrowid
