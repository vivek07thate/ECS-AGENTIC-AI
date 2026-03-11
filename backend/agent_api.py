"""
agent_api.py - FastAPI router for infrastructure agent interactions.

Provides two endpoints:
  POST /agent/submit  – Agents push raw evidence text; the backend runs
                        AI compliance analysis and stores the result.
  POST /evidence/upload – Upload a file (image / PDF / text); OCR is run
                          first, then the same AI pipeline is applied.
  GET  /evidence       – List all stored evidence records.
  GET  /evidence/{id}  – Retrieve a single record by UUID.
"""

import os
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

import database
import dify_client
import ocr_service
from config import UPLOAD_DIR
from sqlalchemy.orm import Session
from database import get_db
from auth import (
    Token, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, 
    get_current_user, RoleChecker, User
)

# Ensure the uploads directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

# Role checkers
admin_only = RoleChecker(["admin"])
auditor_or_admin = RoleChecker(["auditor", "admin"])

# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------

@router.post("/auth/login", response_model=Token, tags=["Auth"])
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user_obj = database.get_user_by_username(db, form_data.username)
    if not user_obj or form_data.password != user_obj.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_obj.username, "role": user_obj.role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me", response_model=User, tags=["Auth"])
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class AgentSubmitRequest(BaseModel):
    """Payload sent by an infrastructure agent."""
    agent_id: str
    evidence_text: str
    evidence_type: str = "text"
    application_name: str = ""
    control: str = ""

class ComplianceResponse(BaseModel):
    """Unified compliance result returned to callers."""
    record_id: str
    agent_id: str
    compliance_status: str
    ai_response: str
    application_name: str = None
    evidence_type: str = None
    
    # Remediation Data
    remediation_plan: str = None
    is_remediated: bool = False
    
    evidence_preview: str
    created_at: str

    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# Endpoint: Agent text submission
# ---------------------------------------------------------------------------

@router.post(
    "/agent/submit",
    response_model=ComplianceResponse,
    summary="Submit evidence text from an infrastructure agent",
    tags=["Agent"],
)
async def agent_submit(
    payload: AgentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Receive raw evidence text from a remote agent, run AI compliance
    analysis via Dify, save the result, and return the verdict.
    """
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Only agents or admins can submit evidence")

    if not payload.evidence_text.strip():
        raise HTTPException(status_code=400, detail="evidence_text must not be empty.")

    ai_result = dify_client.analyze_compliance(
        evidence_text=payload.evidence_text,
        user_id=payload.agent_id,
        control=payload.control or dify_client.DEFAULT_CONTROL,
    )

    record = database.save_evidence(
        db=db,
        agent_id=payload.agent_id,
        evidence_text=payload.evidence_text,
        compliance_status=ai_result["status"],
        ai_response=ai_result["response"],
        application_name=payload.application_name,
        evidence_type=payload.evidence_type,
        source="agent",
    )

    return ComplianceResponse(
        record_id=record.id,
        agent_id=record.agent_id,
        compliance_status=record.compliance_status,
        ai_response=record.ai_response,
        application_name=record.application_name,
        evidence_type=record.evidence_type,
        evidence_preview=record.evidence_text[:300],
        created_at=record.created_at.isoformat(),
    )

# ---------------------------------------------------------------------------
# Endpoint: File upload (OCR → AI analysis)
# ---------------------------------------------------------------------------

@router.post(
    "/evidence/upload",
    response_model=ComplianceResponse,
    summary="Upload an evidence file for OCR + AI compliance analysis",
    tags=["Evidence"],
)
async def evidence_upload(
    agent_id: str = Form(..., description="ID of the submitting agent or user"),
    file: UploadFile = File(..., description="Evidence file (.txt, .jpg, .png, .pdf, …)"),
    control: str = Form("", description="Compliance control being tested (optional)"),
    application_name: str = Form("", description="Target application name (optional)"),
    evidence_type: str = Form("", description="Type of evidence (optional)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accept a file upload, extract text (OCR for images/PDFs, plain-read
    for text files), run AI compliance analysis, save and return the result.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only administrators can upload evidence files.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    safe_name = f"{uuid.uuid4()}_{file.filename}"
    save_path = os.path.join(UPLOAD_DIR, safe_name)
    with open(save_path, "wb") as f:
        f.write(file_bytes)

    extracted_text = ocr_service.extract_text(file_bytes, file.filename)

    ai_result = dify_client.analyze_compliance(
        evidence_text=extracted_text,
        user_id=agent_id,
        control=control or dify_client.DEFAULT_CONTROL,
    )

    record = database.save_evidence(
        db=db,
        agent_id=agent_id,
        evidence_text=extracted_text,
        compliance_status=ai_result["status"],
        ai_response=ai_result["response"],
        application_name=application_name,
        evidence_type=evidence_type,
        source="upload",
    )

    return ComplianceResponse(
        record_id=record.id,
        agent_id=record.agent_id,
        compliance_status=record.compliance_status,
        ai_response=record.ai_response,
        application_name=record.application_name,
        evidence_type=record.evidence_type,
        evidence_preview=record.evidence_text[:300],
        created_at=record.created_at.isoformat(),
    )

# ---------------------------------------------------------------------------
# Endpoint: List all evidence records
# ---------------------------------------------------------------------------

@router.get(
    "/evidence",
    summary="List all stored evidence records",
    tags=["Evidence"],
    dependencies=[Depends(auditor_or_admin)]
)
async def list_evidence(db: Session = Depends(get_db)):
    """Return all evidence records stored in the database, most recent first."""
    return database.get_all_evidence(db)

# ---------------------------------------------------------------------------
# Endpoint: Retrieve single evidence record
# ---------------------------------------------------------------------------

@router.get(
    "/evidence/{evidence_id}",
    summary="Retrieve a single evidence record by ID",
    tags=["Evidence"],
    dependencies=[Depends(auditor_or_admin)]
)
async def get_evidence(evidence_id: str, db: Session = Depends(get_db)):
    """Look up a specific evidence record by its UUID."""
    record = database.get_evidence_by_id(db, evidence_id)
    if record is None:
        raise HTTPException(status_code=404, detail=f"No record found with id '{evidence_id}'.")
    return record

@router.post(
    "/evidence/{evidence_id}/verify",
    summary="Mark an evidence record as verified",
    tags=["Evidence"],
    dependencies=[Depends(auditor_or_admin)]
)
async def verify_evidence(
    evidence_id: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a record as verified by the current auditor/admin."""
    record = database.verify_evidence(db, evidence_id, current_user.username)
    if record is None:
        raise HTTPException(status_code=404, detail=f"No record found with id '{evidence_id}'.")
    return record

# ---------------------------------------------------------------------------
# Endpoint: Autonomous Remediation 
# ---------------------------------------------------------------------------

@router.post(
    "/evidence/{evidence_id}/remediate",
    response_model=ComplianceResponse,
    summary="Generate an AI remediation plan for non-compliant evidence",
    tags=["Agentic AI"],
    dependencies=[Depends(auditor_or_admin)]
)
async def generate_remediation(evidence_id: str, db: Session = Depends(get_db)):
    """Ask Dify for a script/command to fix a non-compliant finding."""
    record = database.get_evidence_by_id(db, evidence_id)
    if not record:
        raise HTTPException(status_code=404, detail="Evidence not found")
        
    if record.compliance_status == "COMPLIANT":
        raise HTTPException(status_code=400, detail="Cannot remediate compliant evidence")

    # Generate the fix
    plan = dify_client.generate_remediation(record.evidence_text, record.ai_response)
    
    # Save it
    updated_record = database.update_remediation_plan(db, evidence_id, plan)

    return ComplianceResponse(
        record_id=updated_record.id,
        agent_id=updated_record.agent_id,
        compliance_status=updated_record.compliance_status,
        ai_response=updated_record.ai_response,
        application_name=updated_record.application_name,
        evidence_type=updated_record.evidence_type,
        remediation_plan=updated_record.remediation_plan,
        is_remediated=updated_record.is_remediated,
        evidence_preview=updated_record.evidence_text[:300],
        created_at=updated_record.created_at.isoformat(),
    )

@router.post(
    "/evidence/{evidence_id}/apply-fix",
    response_model=ComplianceResponse,
    summary="Simulate applying the AI-generated remediation",
    tags=["Agentic AI"],
    dependencies=[Depends(auditor_or_admin)]
)
async def apply_remediation_fix(evidence_id: str, db: Session = Depends(get_db)):
    """Simulate deploying the fix to the infrastructure."""
    record = database.get_evidence_by_id(db, evidence_id)
    if not record or not record.remediation_plan:
        raise HTTPException(status_code=400, detail="No remediation plan exists for this record")

    # Mark as fixed
    updated_record = database.mark_remediated(db, evidence_id)

    return ComplianceResponse(
        record_id=updated_record.id,
        agent_id=updated_record.agent_id,
        compliance_status=updated_record.compliance_status,
        ai_response=updated_record.ai_response,
        application_name=updated_record.application_name,
        evidence_type=updated_record.evidence_type,
        remediation_plan=updated_record.remediation_plan,
        is_remediated=updated_record.is_remediated,
        evidence_preview=updated_record.evidence_text[:300],
        created_at=updated_record.created_at.isoformat(),
    )
