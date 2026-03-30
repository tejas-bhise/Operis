"""
Central configuration loader for Operis.
All environment variables are read here and exposed as a typed Settings object.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application-wide settings loaded from .env file."""

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    ENV: str = os.getenv("ENV", "production")

    # Demo runtime — event generation timing (seconds)
    EVENT_GEN_MIN_SECONDS: int = 10
    EVENT_GEN_MAX_SECONDS: int = 15

    # Demo runtime — monitoring cycle timing (seconds)
    CYCLE_MIN_SECONDS: int = 30
    CYCLE_MAX_SECONDS: int = 45

    # Default analysis window in minutes
    DEFAULT_INTERVAL_MINUTES: int = 30


settings = Settings()