"""
Operis — Operational Intelligence System
FastAPI application entry point.
Registers all routers, initializes PostgreSQL schema, and manages scheduler lifecycle.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine
from app.db.base import Base

# Register all models with SQLAlchemy before create_all
from app.models import event, signal, digest, project_health, monitoring_cycle  # noqa: F401

from app.api.routes import monitoring_routes, signal_routes, digest_routes, health_routes
from app.scheduler.monitoring_scheduler import start_scheduler, stop_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("operis.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles application startup and shutdown."""
    logger.info("Operis backend initializing — creating database schema")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema ready")
    start_scheduler()
    yield
    stop_scheduler()
    logger.info("Operis backend shutdown complete")


app = FastAPI(
    title="Operis — Operational Intelligence System",
    description="Cross-Tool Signal Detection, Risk Monitoring, and Action Recommendation for Founders",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(monitoring_routes.router)
app.include_router(signal_routes.router)
app.include_router(digest_routes.router)
app.include_router(health_routes.router)


@app.get("/", tags=["System"])
def root():
    """Health check endpoint."""
    return {
        "system": "Operis",
        "status": "operational",
        "version": "1.0.0",
    }