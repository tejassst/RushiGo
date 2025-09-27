from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing_extensions import Annotated


class Settings(BaseSettings):
    API_PREFIX: str = Field(default="/api")
    DEBUG: bool = Field(default=False)
    DATABASE_URL: Annotated[str, Field(description="Database connection URL", validate_default=True)] = Field(default="")
    ALLOWED_ORIGINS: str = Field(default="")
    GEMINI_API_KEY: Annotated[str, Field(description="Gemini API Key", validate_default=True)] = Field(default="")

    @field_validator("DATABASE_URL", "GEMINI_API_KEY")
    def validate_required_fields(cls, value: str) -> str:
        if not value or value.strip() == "":
            raise ValueError(f"This field must be provided in environment variables")
        return value

    @field_validator("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, value: str) -> List[str]:
        return value.split(",") if value else []

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()