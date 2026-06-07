import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ForgeFlow AI Backend"
    API_V1_STR: str = "/api"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # LLM Settings
    OPENAI_API_KEY: str = ""
    OPENAI_API_BASE: str = ""  # Useful for proxy or Gemini OpenAI-compatible endpoint
    LLM_MODEL_PLANNER: str = "gpt-4o-mini"
    LLM_MODEL_VALIDATOR: str = "gpt-4o-mini"
    LLM_MODEL_REPAIR: str = "gpt-4o-mini"

    # Fallback to local mock if no API key is present
    USE_LOCAL_FALLBACK: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
