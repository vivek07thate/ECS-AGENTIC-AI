# 🧠 Evidence Collection System (ECS) – Agentic AI Auditor

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![AI](https://img.shields.io/badge/AI-Agentic%20AI-purple)
![Status](https://img.shields.io/badge/Status-Prototype-orange)

## 🚀 Overview

The **Evidence Collection System (ECS)** is an **Agentic AI-powered DevSecOps compliance platform** designed to automate the collection, analysis, and remediation of infrastructure security evidence.

Traditional compliance audits require engineers to manually collect logs, configuration files, and screenshots for auditors. ECS replaces this manual process with **autonomous infrastructure agents and AI-powered reasoning**.

Instead of relying on fragile **regex-based scanners**, ECS uses **Large Language Models (LLMs)** to interpret unstructured evidence and determine compliance with frameworks such as:

* SOC 2
* ISO 27001
* PCI DSS
* NIST

---

# ⚡ Key Features

### 🤖 Agent-Based Evidence Collection

Lightweight Python agents simulate infrastructure telemetry by collecting system configuration evidence.

Example agents:

* Server Agent
* Cloud Agent
* Database Agent

Agents push evidence to the ECS backend via API.

---

### 🧠 AI Compliance Evaluation

The ECS backend sends collected evidence to an **LLM reasoning engine** that:

* Reads configuration output
* Interprets logs and CLI output
* Evaluates compliance rules
* Generates human-readable explanations

Example output:

```
Compliance Status: NON-COMPLIANT

Reason:
System patch updates have not been applied for over 6 months.
Critical security patches are missing.
```

---

### 🛠 Autonomous Remediation

When a compliance issue is detected, ECS can generate **AI-powered remediation scripts**.

Example generated fix:

```bash
sudo apt update && sudo apt upgrade -y
```

Or cloud remediation:

```bash
aws ec2 modify-instance-attribute --instance-id i-12345 --disable-api-termination
```

This reduces **Mean Time To Remediate (MTTR)** from days to seconds.

---

# 🏗 System Architecture

```
+--------------------+
|  Infrastructure    |
|  Agents            |
| (server_agent.py)  |
+---------+----------+
          |
          | HTTP POST
          v
+---------------------------+
|   FastAPI Backend API     |
| /api/v1/agent/submit      |
+------------+--------------+
             |
             v
+---------------------------+
|   AI Reasoning Engine     |
|   (Dify / LLM)            |
+------------+--------------+
             |
             v
+---------------------------+
| PostgreSQL Database       |
| Evidence + AI Verdicts    |
+------------+--------------+
             |
             v
+---------------------------+
| React Security Dashboard  |
+---------------------------+
```

---

# 🔄 System Workflow

```
Agent Collects Evidence
        ↓
Send Evidence → ECS API
        ↓
AI Evaluates Compliance
        ↓
Store Evidence + Verdict
        ↓
Security Team Reviews
        ↓
AI Generates Remediation
```

---

# 📂 Project Structure

```
ECS-AGENTIC-AI
│
├── agents
│   └── server_agent.py
│
├── backend
│   ├── main.py
│   ├── routes
│   ├── services
│   └── dify_client.py
│
├── database
│
├── frontend (optional dashboard)
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/vivek07thate/ECS-AGENTIC-AI.git
cd ECS-AGENTIC-AI
```

---

## 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

Activate:

Windows

```
venv\Scripts\activate
```

Linux/Mac

```
source venv/bin/activate
```

---

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4️⃣ Run Backend

```
cd backend
uvicorn main:app --reload
```

Backend will run at:

```
http://localhost:8000
```

---

## 5️⃣ Run Agent

Open another terminal:

```
cd agents
python server_agent.py
```

Agent will simulate infrastructure telemetry and send evidence to ECS.

---

# 🧪 Example Agent Output

```
ECS – Evidence Collection System
Agent ID : server-agent-001

Evidence Type : PATCH MANAGEMENT
Status        : NON-COMPLIANT

AI Analysis:
Critical security patches have not been applied for 6 months.
Immediate update recommended.
```

---

# 📊 Future Improvements

* Multi-agent orchestration
* Real infrastructure integrations (AWS / Kubernetes)
* Automated remediation execution
* Compliance framework templates
* Vector database for semantic evidence search
* RAG-based investigation assistant
* Security dashboard with alerts

---

# 🧠 Why Agentic AI?

Traditional tools rely on:

❌ Static rule matching
❌ Regex-based scanning
❌ Manual remediation

ECS introduces **Agentic AI**, where AI systems:

* Evaluate environments autonomously
* Generate tools (scripts)
* Assist in fixing infrastructure issues

---

# 👨‍💻 Author

**Vivekanand Thate**

IT Support Engineer | DevSecOps Enthusiast | AI Systems Builder

GitHub:
https://github.com/vivek07thate

---

# ⭐ If you like this project

Give the repo a **star** and feel free to contribute!
