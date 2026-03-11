import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, User, Evidence
from datetime import datetime, timezone
from typing import Any
import uuid

# Load environment variables
load_dotenv()

# Database connection URL - Default to local PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ecs_db")

# Create engine and sessionmaker
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Create all tables and seed initial data if needed."""
    Base.metadata.create_all(bind=engine)
    
    # Seed mock users if the table is empty
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            for username, data in MOCK_USERS.items():
                user = User(
                    username=username,
                    full_name=data["full_name"],
                    password_hash=data["password_hash"],
                    role=data["role"],
                    department=data["department"]
                )
                db.add(user)
            db.commit()
    finally:
        db.close()

def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Mock data kept here for initial seeding logic
MOCK_USERS = {
    "admin": {
        "username": "admin",
        "full_name": "Admin User",
        "password_hash": "sec-a-001",
        "role": "admin",
        "department": "Security Operations"
    },
    "auditor": {
        "username": "auditor",
        "full_name": "Compliance Auditor",
        "password_hash": "sec-aud-001",
        "role": "auditor",
        "department": "Risk Management"
    },
    "agent": {
        "username": "agent",
        "full_name": "Automation Agent",
        "password_hash": "agent-001",
        "role": "agent",
        "department": "Infrastructure"
    }
}

def get_user_by_username(db: Session, username: str) -> User | None:
    """Look up a user in the database."""
    return db.query(User).filter(User.username == username).first()

def save_evidence(
    db: Session,
    agent_id: str,
    evidence_text: str,
    compliance_status: str,
    ai_response: str,
    application_name: str = None,
    evidence_type: str = None,
    source: str = "agent",
    remediation_plan: str = None,
    is_remediated: bool = False,
) -> Evidence:
    """Persist an evidence record to the database."""
    record = Evidence(
        id=str(uuid.uuid4()),
        agent_id=agent_id,
        evidence_text=evidence_text,
        compliance_status=compliance_status,
        ai_response=ai_response,
        application_name=application_name,
        evidence_type=evidence_type,
        remediation_plan=remediation_plan,
        is_remediated=is_remediated,
        source=source,
        is_verified=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def verify_evidence(db: Session, evidence_id: str, verifier_username: str) -> Evidence | None:
    """Mark an evidence record as verified."""
    record = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if record:
        record.is_verified = True
        record.verified_by = verifier_username
        record.verified_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(record)
    return record

def get_all_evidence(db: Session) -> list[Evidence]:
    """Return all stored evidence records (most recent first)."""
    return db.query(Evidence).order_by(Evidence.created_at.desc()).all()

def get_evidence_by_id(db: Session, evidence_id: str) -> Evidence | None:
    """Return a single evidence record by its UUID."""
    return db.query(Evidence).filter(Evidence.id == evidence_id).first()

def update_remediation_plan(db: Session, evidence_id: str, plan_text: str) -> Evidence | None:
    """Save an AI-generated remediation plan to an evidence record."""
    record = get_evidence_by_id(db, evidence_id)
    if record:
        record.remediation_plan = plan_text
        db.commit()
        db.refresh(record)
    return record

def mark_remediated(db: Session, evidence_id: str) -> Evidence | None:
    """Mark an evidence record as successfully remediated."""
    record = get_evidence_by_id(db, evidence_id)
    if record:
        record.is_remediated = True
        record.compliance_status = "REMEDIATED"
        db.commit()
        db.refresh(record)
    return record
