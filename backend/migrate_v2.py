import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env")
        return

    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Adding application_name column...")
        try:
            cur.execute("ALTER TABLE evidence ADD COLUMN application_name VARCHAR;")
        except psycopg2.errors.DuplicateColumn:
            print("Column application_name already exists.")
            
        print("Adding evidence_type column...")
        try:
            cur.execute("ALTER TABLE evidence ADD COLUMN evidence_type VARCHAR;")
        except psycopg2.errors.DuplicateColumn:
            print("Column evidence_type already exists.")
            
        cur.close()
        conn.close()
        print("Migration completed successfully.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
