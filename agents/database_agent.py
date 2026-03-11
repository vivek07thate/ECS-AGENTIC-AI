"""
database_agent.py - Simulated database infrastructure agent for the ECS prototype.

This script mimics a database security agent that:
  1. Collects simulated evidence (backup policies, data masking, access reviews)
  2. Sends evidence to the ECS backend via HTTP POST
  3. Prints the AI compliance verdict returned by the backend

Usage:
    python database_agent.py
"""

import json
import sys
import time
from datetime import datetime, timezone

import requests

ECS_BASE_URL = "http://localhost:8000"
SUBMIT_ENDPOINT = f"{ECS_BASE_URL}/api/v1/agent/submit"
LOGIN_ENDPOINT = f"{ECS_BASE_URL}/api/v1/auth/login"
AGENT_ID = "db-agent-002"

AGENT_USERNAME = "agent"
AGENT_PASSWORD = "agent-001"

auth_token = None

EVIDENCE_SAMPLES = [
    {
        "control": "database_backups",
        "evidence_type": "Configuration File",
        "application_name": "Core Banking",
        "evidence_text": (
            "Database Backup Audit – DB: CORE-DB-01\n"
            "Full backups: Daily at 02:00 AM UTC\n"
            "Incremental backups: Every 4 hours\n"
            "Retention period: 30 days onsite, 7 years offsite archive\n"
            "Last successful restore test: 2026-02-10\n"
            "Backup encryption: AES-256 Enabled"
        ),
    },
    {
        "control": "data_masking",
        "evidence_type": "Audit Report",
        "application_name": "Customer Portal",
        "evidence_text": (
            "Data Masking Policy Audit – Environment: Non-Production\n"
            "Masking tool: Redgate Data Masker\n"
            "PII columns masked: SSN, Credit Card, Date of Birth, Email\n"
            "Format preserving encryption: ENABLED\n"
            "Access to unmasked data in QA: DENIED for all developers\n"
            "Last audit: 2026-03-01\n"
            "Status: Implementation complete"
        ),
    },
    {
        "control": "access_review",
        "evidence_type": "Log File",
        "application_name": "Payment Gateway",
        "evidence_text": (
            "User Access Review – DB: PAY-DB-01\n"
            "Review frequency: Quarterly\n"
            "Orphaned accounts found: 2 (Disabled immediately)\n"
            "Over-privileged accounts identified: 0\n"
            "DBA access logging: ENABLED\n"
            "Reviewer: Security Team (S. Smith)\n"
            "Completion Date: 2026-01-05"
        ),
    },
]

def get_token() -> str | None:
    global auth_token
    if auth_token:
        return auth_token

    try:
        data = {"username": AGENT_USERNAME, "password": AGENT_PASSWORD}
        response = requests.post(LOGIN_ENDPOINT, data=data, timeout=10)
        response.raise_for_status()
        auth_token = response.json().get("access_token")
        return auth_token
    except Exception as e:
        print(f"  [ERROR] Authentication failed: {e}")
        return None

def collect_evidence(sample: dict) -> dict:
    timestamp = datetime.now(timezone.utc).isoformat()
    return {
        "agent_id": AGENT_ID,
        "control": sample["control"],
        "application_name": sample["application_name"],
        "evidence_type": sample["evidence_type"],
        "evidence_text": sample["evidence_text"],
        "collected_at": timestamp,
    }

def submit_evidence(evidence: dict) -> dict | None:
    token = get_token()
    if not token:
        return None

    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "agent_id": evidence["agent_id"],
        "evidence_text": evidence["evidence_text"],
        "evidence_type": evidence["evidence_type"],
        "application_name": evidence["application_name"],
        "control": evidence["control"],
    }

    try:
        response = requests.post(SUBMIT_ENDPOINT, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        print(
            f"  [ERROR] Cannot connect to ECS backend at {ECS_BASE_URL}. "
            "Is the server running?"
        )
        return None
    except requests.exceptions.HTTPError as e:
        print(f"  [ERROR] HTTP {e.response.status_code}: {e.response.text}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"  [ERROR] Request failed: {e}")
        return None

def display_result(evidence: dict, result: dict | None) -> None:
    sep = "=" * 60
    print(sep)
    print(f"  Application   : {evidence['application_name']}")
    print(f"  Evidence Type : {evidence['evidence_type']}")
    print(f"  Control       : {evidence['control'].upper().replace('_', ' ')}")
    print(f"  Collected At  : {evidence['collected_at']}")
    if result:
        status = result.get("compliance_status", "UNKNOWN")
        record_id = result.get("record_id", "N/A")
        colour = {
            "COMPLIANT": "\033[92m",
            "NON-COMPLIANT": "\033[91m",
            "NEEDS REVIEW": "\033[93m",
        }.get(status, "\033[0m")
        reset = "\033[0m"
        print(f"  Status        : {colour}{status}{reset}")
        print(f"  Record ID     : {record_id}")
        print(f"\n  AI Analysis:\n  {result.get('ai_response', '')}")
    else:
        print("  Status        : \033[91mSUBMISSION FAILED\033[0m")
    print(sep)
    print()

def run_agent():
    print("\n" + "=" * 60)
    print("  ECS – Database Security Agent")
    print(f"  Agent ID : {AGENT_ID}")
    print(f"  Backend  : {ECS_BASE_URL}")
    print("=" * 60 + "\n")

    for i, sample in enumerate(EVIDENCE_SAMPLES, start=1):
        print(f"[{i}/{len(EVIDENCE_SAMPLES)}] Collecting evidence for: {sample['application_name']} - {sample['control']}")
        evidence = collect_evidence(sample)

        print(f"  Submitting to ECS backend …")
        result = submit_evidence(evidence)

        display_result(evidence, result)

        if i < len(EVIDENCE_SAMPLES):
            time.sleep(1)

    print("Agent run complete. All database evidence submitted.\n")

if __name__ == "__main__":
    run_agent()
