import os
from dotenv import load_dotenv
import psycopg2
from urllib.parse import urlparse

# Load environment variables
load_dotenv()

# Database connection URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ecs_db")

def migrate():
    """Add remediation columns to evidence table."""
    print(f"Connecting to database: {DATABASE_URL}")
    
    # Parse URL to get connection parameters
    result = urlparse(DATABASE_URL)
    username = result.username
    password = result.password
    database = result.path[1:]
    hostname = result.hostname
    port = result.port

    try:
        # Connect to the database
        conn = psycopg2.connect(
            database=database,
            user=username,
            password=password,
            host=hostname,
            port=port
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Add remediation_plan column
        try:
            print("Adding remediation_plan column...")
            cursor.execute("ALTER TABLE evidence ADD COLUMN remediation_plan TEXT;")
            print("Successfully added remediation_plan column.")
        except psycopg2.errors.DuplicateColumn:
            print("Column remediation_plan already exists, skipping.")
            
        # Add is_remediated column
        try:
            print("Adding is_remediated column...")
            cursor.execute("ALTER TABLE evidence ADD COLUMN is_remediated BOOLEAN DEFAULT FALSE;")
            print("Successfully added is_remediated column.")
        except psycopg2.errors.DuplicateColumn:
            print("Column is_remediated already exists, skipping.")

        print("\nMigration V3 complete! Evidence table now supports Autonomous Remediation.")
        
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    migrate()
