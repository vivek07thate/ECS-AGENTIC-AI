"""
dify_client.py - Dify AI API integration for compliance analysis.

Calls the Dify chat-messages API, passing both {{control}} and {{evidence}}
as input variables defined in the Dify app's system prompt template.
"""

import requests
from config import DIFY_BASE_URL, DIFY_API_KEY, DIFY_COMPLETION_ENDPOINT


# Default control descriptor used when no specific control is given
DEFAULT_CONTROL = (
    "General cybersecurity compliance control – verify that the evidence "
    "demonstrates secure configuration, access control, and policy adherence "
    "as per PCI DSS, ISO 27001, or RBI Cybersecurity Guidelines."
)


def analyze_compliance(
    evidence_text: str,
    user_id: str = "ecs-backend",
    control: str = DEFAULT_CONTROL,
) -> dict:
    """
    Send evidence text (and an optional control description) to the Dify AI
    app and return a structured compliance result.

    Parameters
    ----------
    evidence_text : The raw evidence string to be analysed.
    user_id       : A user/session identifier passed to the Dify API.
    control       : The specific compliance control being evaluated.
                    Injected into the {{control}} variable of the Dify prompt.

    Returns
    -------
    dict with keys:
        - status   : "COMPLIANT" | "NON-COMPLIANT" | "NEEDS REVIEW" | "ERROR"
        - response : Full AI response text (or error detail)
    """
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json",
    }

    # Dify chat-messages payload (blocking mode → synchronous response).
    # The 'inputs' dict maps to the {{variable}} placeholders in the Dify
    # app's system / user prompt template.
    payload = {
        "inputs": {
            "control": control,
            "evidence": evidence_text,
        },
        # query is a required field for chat-messages; we use a short
        # instruction that reinforces the structured output format.
        "query": (
            "Analyze the evidence against the control and return the result "
            "strictly in the required three-section format."
        ),
        "response_mode": "blocking",
        "user": user_id,
    }

    url = f"{DIFY_BASE_URL}{DIFY_COMPLETION_ENDPOINT}"

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=90)
        response.raise_for_status()

        data = response.json()

        # Dify returns the model output in the "answer" field
        ai_text: str = data.get("answer", "").strip()

        status = _extract_status(ai_text)

        return {"status": status, "response": ai_text}

    except requests.exceptions.HTTPError as http_err:
        error_detail = (
            f"HTTP error calling Dify API: {http_err} | Key used: {DIFY_API_KEY} | Body: {response.text}"
        )
        return {"status": "ERROR", "response": error_detail}

    except requests.exceptions.RequestException as req_err:
        error_detail = f"Network error calling Dify API: {req_err} | Key used: {DIFY_API_KEY}"
        return {"status": "ERROR", "response": error_detail}


def _extract_status(ai_text: str) -> str:
    """
    Parse the AI response text to find the compliance verdict keyword.

    The Dify model is instructed to prefix the verdict with
    'Compliance Status: ', so we check that line first, then fall back
    to substring search for robustness.
    """
    upper = ai_text.upper()

    # Prefer the explicit "Compliance Status:" line produced by the prompt
    for line in upper.splitlines():
        if "COMPLIANCE STATUS:" in line:
            if "NON-COMPLIANT" in line:
                return "NON-COMPLIANT"
            if "COMPLIANT" in line:
                return "COMPLIANT"
            if "NEEDS REVIEW" in line:
                return "NEEDS REVIEW"

    # Fallback: scan the full response
    if "NON-COMPLIANT" in upper:
        return "NON-COMPLIANT"
    if "COMPLIANT" in upper:
        return "COMPLIANT"
    if "NEEDS REVIEW" in upper:
        return "NEEDS REVIEW"

    return "NEEDS REVIEW"

def generate_remediation(evidence_text: str, ai_analysis: str) -> str:
    """
    Query Dify specifically to generate a strict, actionable bash/Python script 
    or CLI command to fix the finding, based on the non-compliant evidence.
    """
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json",
    }
    
    prompt = (
        f"You are an expert DevSecOps engineer. An automated scan found the following misconfiguration "
        f"in our infrastructure. Generate a direct, actionable script (Bash, Python, AWS CLI, etc.) "
        f"that an engineer can run to immediately fix this issue. Do NOT provide theoretical advice. "
        f"ONLY supply the code block. \n\n"
        f"Evidence Data:\n{evidence_text}\n\n"
        f"Initial Analysis:\n{ai_analysis}"
    )

    payload = {
        "inputs": {
            "control": "Generate Remediation Script",
            "evidence": evidence_text, 
        },
        "query": prompt,
        "response_mode": "blocking",
        "user": "ecs-remediation-agent",
    }

    url = f"{DIFY_BASE_URL}{DIFY_COMPLETION_ENDPOINT}"

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=90)
        response.raise_for_status()
        data = response.json()
        ai_text = data.get("answer", "").strip()
        
        # If the LLM returns backticks, keep them, or wrap it nicely
        if "```" not in ai_text:
            ai_text = f"```bash\n{ai_text}\n```"
            
        return ai_text

    except requests.exceptions.RequestException as req_err:
        return f"```text\nError calling AI for remediation: {req_err}\n```"
