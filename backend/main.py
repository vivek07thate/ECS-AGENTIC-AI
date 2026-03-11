"""
main.py - FastAPI application entrypoint for the ECS (Evidence Collection System).

Initialises the app, mounts all routers, and exposes a health-check endpoint.

Run with:
    uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import agent_api
import database

# ---------------------------------------------------------------------------
# Application initialisation
# ---------------------------------------------------------------------------

# Create database tables and seed mock data
database.init_db()

app = FastAPI(
    title="ECS – Evidence Collection System",
    description=(
        "Agentic AI prototype for cybersecurity compliance audits. "
        "Infrastructure agents submit evidence which is analysed by an AI "
        "compliance engine (powered by Dify) and stored for review."
    ),
    version="0.1.0",
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc UI
)

# ---------------------------------------------------------------------------
# CORS middleware – allow all origins for local development
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Include routers
# ---------------------------------------------------------------------------

# All agent / evidence endpoints are grouped under the /api/v1 prefix
app.include_router(agent_api.router, prefix="/api/v1")

# ---------------------------------------------------------------------------
# Health check endpoint
# ---------------------------------------------------------------------------

@app.get("/health", tags=["System"], summary="Health check")
async def health_check():
    """
    Simple liveness probe.
    Returns HTTP 200 with a JSON body as long as the server is running.
    """
    return {
        "status": "ok",
        "service": "ECS – Evidence Collection System",
        "version": "0.1.0",
    }


@app.get("/", tags=["System"], summary="API root")
async def root():
    """Redirect users to the interactive API documentation."""
    return {
        "message": "Welcome to ECS – Evidence Collection System",
        "docs": "/docs",
        "health": "/health",
    }
