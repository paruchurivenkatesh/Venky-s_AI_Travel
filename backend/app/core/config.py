import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend directory
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "Venky's AI Travel"
    PROJECT_TAGLINE: str = "Your AI-Powered India Travel Planner"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Environment & Demo Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "venkys-secret-travel-key-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./venkys_travel.db")

    # External APIs
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    GOOGLE_MAPS_MAPS_ID: str = os.getenv("GOOGLE_MAPS_MAPS_ID", "")
    KOSON_API_KEY: str = os.getenv("KOSON_API_KEY", "")
    DATA_GOV_API_KEY: str = os.getenv("DATA_GOV_API_KEY", "")
    API_SETU_API_KEY: str = os.getenv("API_SETU_API_KEY", "")
    INDIAN_DATA_PROJECT_API_KEY: str = os.getenv("INDIAN_DATA_PROJECT_API_KEY", "")

    # LLM Settings
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", os.getenv("GEMINI_API_KEY", os.getenv("OPENAI_API_KEY", "")))
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini") # gemini, openai, or local_fallback
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-2.0-flash")

    # Supabase (Optional)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()
