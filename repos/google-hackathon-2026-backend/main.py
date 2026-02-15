from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from app.database import engine, Base
from app.models import models

load_dotenv()

# Initialize DB
models.Base.metadata.create_all(bind=engine)

import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Travel Experience Designer API",
    description="Backend API for generating travel proposals and video previews using Google Gemini.",
    version="0.1.0"
)

# Mount static files for local uploads
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Log server startup
@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up...")

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation Error at {request.url}: {exc}")
    try:
        body = await request.body()
        logger.error(f"Body: {body.decode()}")
    except:
        pass
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


from app.api.endpoints import plan, media, search, report, places, auth, users, social
app.include_router(plan.router, prefix="/api/v1/plan", tags=["plan"])
app.include_router(media.router, prefix="/api/v1/media", tags=["media"])
app.include_router(search.router, prefix="/api/v1/search", tags=["search"])
app.include_router(report.router, prefix="/api/v1/report", tags=["report"])
app.include_router(places.router, prefix="/api/v1/places", tags=["places"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(social.router, prefix="/api/v1/social", tags=["social"])

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*" # For dev flexibility
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Travel Experience Designer API is running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
