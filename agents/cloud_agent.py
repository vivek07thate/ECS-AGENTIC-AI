"""
cloud_agent.py - Simulated cloud infrastructure agent for the ECS prototype.

This script mimics a cloud scanning security agent that:
  1. Collects simulated evidence (IAM policies, S3 access, Security Groups)
  2. Sends evidence to the ECS backend via HTTP POST
  3. Prints the AI compliance verdict returned by the backend

Usage:
    python cloud_agent.py
"""

import json
import sys
import time
from datetime import datetime, timezone

import requests

ECS_BASE_URL = "http://localhost:8000"
SUBMIT_ENDPOINT = f"{ECS_BASE_URL}/api/v1/agent/submit"
LOGIN_ENDPOINT = f"{ECS_BASE_URL}/api/v1/auth/login"
AGENT_ID = "cloud-agent-003"

AGENT_USERNAME = "agent"
AGENT_PASSWORD = "agent-001"

auth_token = None

EVIDENCE_SAMPLES = [
    {
        "control": "iam_least_privilege",
        "evidence_type": "Audit Report",
        "application_name": "Mobile Banking App",
        "evidence_text": (
            "IAM Policy Audit – Cloud Account: 123456789012\n"
            "Over-privileged users detected: 1 (User 'dev-test' has AdministratorAccess)\n"
            "MFA on Root Account: ENABLED\n"
            "MFA for regular users: 98% enforcement\n"
            "Inactive keys older than 90 days: 3 found\n"
            "Last continuous scan: 2026-03-10\n"
            "Status: Remediation required"
        ),
    },
    {
        "control": "s3_public_access",
        "evidence_type": "Configuration File",
        "application_name": "Customer Portal",
        "evidence_text": (
            "S3 Bucket Configuration – Bucket: customer-portal-assets-prod\n"
            "Block Public Access settings:\n"
            "  BlockPublicAcls: True\n"
            "  IgnorePublicAcls: True\n"
            "  BlockPublicPolicy: True\n"
            "  RestrictPublicBuckets: True\n"
            "Encryption: SSE-KMS enabled\n"
            "Versioning: Enabled\n"
            "Status: Secure"
        ),
    },
    {
        "control": "network_security_group",
        "evidence_type": "Log File",
        "application_name": "ATM Network",
        "evidence_text": (
            "Network Security Group Audit – VPC: vpc-atm-net-01\n"
            "Rule Evaluation:\n"
            "  - Inbound port 22 (SSH) open to 0.0.0.0/0: FAILED (Found 1 instance)\n"
            "  - Inbound port 3389 (RDP) open to 0.0.0.0/0: PASSED\n"
            "  - All intra-VPC traffic allowed: PASSED\n"
            "Flow Logs: Enabled and exporting to CloudWatch\n"
            "Observation: Critical misconfiguration on SG-WEB-02 permitting global SSH."
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
    print("  ECS – Cloud Security Agent")
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

    print("Agent run complete. All cloud evidence submitted.\n")

if __name__ == "__main__":
    run_agent()
