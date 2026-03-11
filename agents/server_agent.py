"""
server_agent.py - Simulated infrastructure agent for the ECS prototype.

This script mimics a server-side security agent that:
  1. Collects simulated evidence (password policy, firewall config, etc.)
  2. Sends evidence to the ECS backend via HTTP POST
  3. Prints the AI compliance verdict returned by the backend

Usage:
    python server_agent.py

The ECS backend must be running first:
    cd backend && uvicorn main:app --reload
"""

import json
import sys
import time
from datetime import datetime, timezone

import requests

# ---------------------------------------------------------------------------
# Configuration – update these if your backend is on a different host/port
# ---------------------------------------------------------------------------

ECS_BASE_URL = "http://localhost:8000"
SUBMIT_ENDPOINT = f"{ECS_BASE_URL}/api/v1/agent/submit"
LOGIN_ENDPOINT = f"{ECS_BASE_URL}/api/v1/auth/login"
AGENT_ID = "server-agent-001"

# Agent credentials for authentication
AGENT_USERNAME = "agent"
AGENT_PASSWORD = "agent-001"

# Global token to be reused across submissions
auth_token = None

# ---------------------------------------------------------------------------
# Simulated evidence payloads
# Each dict represents a different security control being checked.
# ---------------------------------------------------------------------------

EVIDENCE_SAMPLES = [
    {
        "control": "password_policy",
        "evidence_type": "Audit Report",
        "application_name": "Core Banking",
        "evidence_text": (
            "Password Policy Audit – Server: PROD-WEB-01\n"
            "Minimum password length: 14 characters\n"
            "Complexity requirements: Uppercase, lowercase, digits, symbols – ENABLED\n"
            "Password expiry: 90 days\n"
            "Account lockout after: 5 failed attempts\n"
            "Multi-factor authentication: ENABLED for all privileged accounts\n"
            "Last reviewed: 2026-01-15"
        ),
    },
    {
        "control": "firewall_config",
        "evidence_type": "Configuration File",
        "application_name": "Payment Gateway",
        "evidence_text": (
            "Firewall Configuration Audit – Server: PROD-DB-02\n"
            "Default inbound rule: DENY ALL\n"
            "Allowed inbound ports: 443 (HTTPS), 22 (SSH from bastion only)\n"
            "Outbound rules: Restrict to known external IPs – DISABLED\n"
            "Logging: Enabled, forwarding to SIEM\n"
            "Last rule update: 2025-11-01"
        ),
    },
    {
        "control": "patch_management",
        "evidence_type": "Log File",
        "application_name": "Customer Portal",
        "evidence_text": (
            "Patch Management Report – Server: PROD-APP-03\n"
            "OS: Ubuntu 22.04 LTS\n"
            "Last system update: 2025-09-10 (6 months ago)\n"
            "Missing critical patches: 7\n"
            "Missing high-severity patches: 14\n"
            "Automated patching: DISABLED\n"
            "Patch approval workflow: Not documented"
        ),
    },
    {
        "control": "encryption_policy",
        "evidence_type": "PDF Document",
        "application_name": "Mobile Banking App",
        "evidence_text": (
            "Encryption Policy Audit – Server: PROD-STORAGE-04\n"
            "Data at rest: AES-256 encryption – ENABLED\n"
            "Data in transit: TLS 1.3 – ENABLED\n"
            "TLS 1.0 / 1.1 disabled: YES\n"
            "Certificate management: Automated renewal via Let's Encrypt\n"
            "Key rotation: Every 12 months\n"
            "HSM usage: No"
        ),
    },
]


# ---------------------------------------------------------------------------
# Agent core functions
# ---------------------------------------------------------------------------

def get_token() -> str | None:
    """Authenticate with the ECS backend and retrieve a JWT token."""
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
    """
    Simulate evidence collection from a local server.

    In a real agent this would query OS APIs, parse config files, read
    audit logs, etc.  Here we simply return the pre-defined sample.
    """
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
    """
    HTTP POST the collected evidence to the ECS backend.

    Returns the parsed JSON response, or None on failure.
    """
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
            "Is the server running? (uvicorn main:app --reload)"
        )
        return None
    except requests.exceptions.HTTPError as e:
        print(f"  [ERROR] HTTP {e.response.status_code}: {e.response.text}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"  [ERROR] Request failed: {e}")
        return None


def display_result(evidence: dict, result: dict | None) -> None:
    """Pretty-print the compliance verdict to stdout."""
    sep = "=" * 60
    print(sep)
    print(f"  Application   : {evidence['application_name']}")
    print(f"  Evidence Type : {evidence['evidence_type']}")
    print(f"  Control       : {evidence['control'].upper().replace('_', ' ')}")
    print(f"  Collected At  : {evidence['collected_at']}")
    if result:
        status = result.get("compliance_status", "UNKNOWN")
        record_id = result.get("record_id", "N/A")
        # Colour-code the output (works on most terminals)
        colour = {
            "COMPLIANT": "\033[92m",       # green
            "NON-COMPLIANT": "\033[91m",   # red
            "NEEDS REVIEW": "\033[93m",    # yellow
        }.get(status, "\033[0m")
        reset = "\033[0m"
        print(f"  Status        : {colour}{status}{reset}")
        print(f"  Record ID     : {record_id}")
        print(f"\n  AI Analysis:\n  {result.get('ai_response', '')}")
    else:
        print("  Status        : \033[91mSUBMISSION FAILED\033[0m")
    print(sep)
    print()


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def run_agent():
    print("\n" + "=" * 60)
    print("  ECS – Evidence Collection System")
    print(f"  Agent ID : {AGENT_ID}")
    print(f"  Backend  : {ECS_BASE_URL}")
    print("=" * 60 + "\n")

    for i, sample in enumerate(EVIDENCE_SAMPLES, start=1):
        print(f"[{i}/{len(EVIDENCE_SAMPLES)}] Collecting evidence for: {sample['application_name']} - {sample['control']}")
        evidence = collect_evidence(sample)

        print(f"  Submitting to ECS backend …")
        result = submit_evidence(evidence)

        display_result(evidence, result)

        # Small pause between submissions to avoid hammering the API
        if i < len(EVIDENCE_SAMPLES):
            time.sleep(1)

    print("Agent run complete. All evidence submitted.\n")


if __name__ == "__main__":
    run_agent()
