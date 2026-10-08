import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.session import engine, Base
from app.database import models # ensure all models are registered
from app.api.auth import router as auth_router
from app.api.trips import router as trips_router
from app.api.destinations import router as destinations_router
from app.api.search import router as search_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("venkys_travel")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables are created
    logger.info("Initializing Venky's AI Travel Database Schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Venky's AI Travel Multi-Agent Engine is Ready. Target Country: India Only.")
    yield
    # Shutdown
    logger.info("Venky's AI Travel Service shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Your AI-Powered India Travel Planner — An India-Only Generative AI Multi-Agent Travel Planner.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(trips_router, prefix=settings.API_V1_STR)
app.include_router(destinations_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION,
        "scope": "INDIA ONLY",
        "demo_mode": settings.DEMO_MODE,
        "docs_url": "/docs",
        "status": "Operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
