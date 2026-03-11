from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True, index=True)
    full_name = Column(String)
    password_hash = Column(String)
    role = Column(String)
    department = Column(String)

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, index=True)
    evidence_text = Column(Text)
    compliance_status = Column(String)
    ai_response = Column(Text)
    application_name = Column(String, nullable=True)
    evidence_type = Column(String, nullable=True)
    
    # Remediation tracking
    remediation_plan = Column(Text, nullable=True)
    is_remediated = Column(Boolean, default=False)
    
    source = Column(String, default="agent")
    is_verified = Column(Boolean, default=False)
    verified_by = Column(String, ForeignKey("users.username"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    verifier = relationship("User", foreign_keys=[verified_by])
