import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

def create_database():
    # Connection URL to default postgres db
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
    
    try:
        # Extract connection details from URL or use defaults
        # Simple parsing for prototype
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="postgres",
            host="localhost",
            port="5432"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'ecs_db'")
        exists = cur.fetchone()
        
        if not exists:
            cur.execute('CREATE DATABASE ecs_db')
            print("Database ecs_db created successfully.")
        else:
            print("Database ecs_db already exists.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
