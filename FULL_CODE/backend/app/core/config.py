"""CoverWise application configuration.

Reads all settings from environment variables or a .env file.
Never hardcode secrets here.
"""

from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "postgresql+psycopg://coverwise_user:password@localhost:5432/coverwise"

    # Security
    secret_key: str = "CHANGE-ME-IN-PRODUCTION"
    environment: str = "development"  # development | production

    # CORS
    cors_origins: str = "http://localhost:5173"

    # Session
    session_max_age_seconds: int = 1800  # 30 minutes

    # Admin seed
    admin_email: str = "admin@coverwise.local"
    admin_password: str = "CHANGE-ME"
    advisor_default_password: str = "CHANGE-ME"

    # Dataset path (relative to FULL_CODE/)
    b2_data_dir: str = "data/B2_Life_Insurance_Needs_Finder/data"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def data_dir_path(self) -> Path:
        """Resolve the B2 data directory relative to FULL_CODE/."""
        # config.py is at backend/app/core/config.py
        # Walk up: core/ -> app/ -> backend/ -> FULL_CODE/
        full_code_dir = Path(__file__).resolve().parent.parent.parent.parent
        return full_code_dir / self.b2_data_dir

    model_config = {
        # config.py -> core/ -> app/ -> backend/ -> FULL_CODE/.env
        "env_file": str(Path(__file__).resolve().parent.parent.parent.parent / ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


# Singleton instance
settings = Settings()
