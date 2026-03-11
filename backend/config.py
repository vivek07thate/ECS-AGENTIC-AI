"""
config.py - Central configuration for the ECS backend.

Loads settings from environment variables (or a .env file) so that
sensitive values (like API keys) are never hard-coded in source files.
"""

import os
from dotenv import load_dotenv

# Load variables from a .env file if one is present in the working directory
load_dotenv()

# ---------------------------------------------------------------------------
# Dify AI Integration Settings
# ---------------------------------------------------------------------------
# Base URL of your Dify deployment (cloud or self-hosted)
DIFY_BASE_URL: str = os.getenv("DIFY_BASE_URL", "https://api.dify.ai/v1")

# Your Dify application API key  ← set this in your .env file as DIFY_API_KEY
DIFY_API_KEY: str = os.getenv("DIFY_API_KEY", "your-dify-api-key-here")

# The Dify chat/completion endpoint path (relative to DIFY_BASE_URL)
# Use "/chat-messages" for Chatbot apps
# Use "/completion-messages" for Text Generation apps
DIFY_COMPLETION_ENDPOINT: str = os.getenv(
    "DIFY_COMPLETION_ENDPOINT", "/chat-messages"
)

# ---------------------------------------------------------------------------
# General Application Settings
# ---------------------------------------------------------------------------
# Directory where uploaded evidence files are stored temporarily
UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
