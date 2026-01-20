from typing import List, Optional, Union
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing_extensions import Annotated


class Settings(BaseSettings):
    API_PREFIX: str = Field(default="/api")
    DEBUG: bool = Field(default=False)
    DATABASE_URL: Annotated[str, Field(description="Database connection URL", validate_default=True)] = Field(default="")
    ALLOWED_ORIGINS: Union[str, List[str]] = Field(default="")
    GEMINI_API_KEY: Annotated[str, Field(description="Gemini API Key", validate_default=True)] = Field(default="")
    BACKEND_URL: str = Field(default="http://localhost:8000")
    FRONTEND_URL: str = Field(default="http://localhost:5174")
    
    # Supabase configuration
    SUPABASE_URL: str = Field(default="")
    SUPABASE_ANON_KEY: str = Field(default="")
    
    # Email configuration (Gmail API)
    GMAIL_CREDENTIALS_PATH: str = Field(default="/etc/secrets/credentials.json")
    GMAIL_TOKEN_PATH: str = Field(default="/etc/secrets/token.json")
    FROM_EMAIL: str = Field(default="RushiGo Notifications")
    
    # Google Calendar OAuth
    GOOGLE_CLIENT_ID: str = Field(default="")
    GOOGLE_CLIENT_SECRET: str = Field(default="")
    CALENDAR_CREDENTIALS_JSON: str = Field(default="")

    @field_validator("DATABASE_URL", "GEMINI_API_KEY")
    def validate_required_fields(cls, value: str) -> str:
        if not value or value.strip() == "":
            raise ValueError(f"This field must be provided in environment variables")
        return value
    
    @property
    def is_postgresql(self) -> bool:
        """Check if using PostgreSQL database"""
        return self.DATABASE_URL.startswith("postgresql://") or self.DATABASE_URL.startswith("postgres://")

    @field_validator("ALLOWED_ORIGINS", mode='before')
    @classmethod
    def parse_allowed_origins(cls, value) -> List[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        elif isinstance(value, list):
            return value
        return []

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()