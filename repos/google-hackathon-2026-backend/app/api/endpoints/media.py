from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Union
import logging
import asyncio
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import models

router = APIRouter()
logger = logging.getLogger(__name__)

class VideoRequest(BaseModel):
    proposalId: Union[str, int]
    title: str
    description: str
    user_profile_image_url: str | None = None
    user_id: int | None = None

class VideoResponse(BaseModel):
    videoUrls: List[str]
    generated_image_url: str | None = None

class VideoAIResponse(BaseModel):
    video_url: str

from app.api.endpoints.auth import get_current_user

@router.post("/generate-video", response_model=VideoResponse)
async def generate_video(request: VideoRequest, db: Session = Depends(get_db)):
    """
    Returns a list of appropriate short video URLs matching the travel plan, 
    and a generated image of the user at the destination.
    """
    user_img = request.user_profile_image_url or "None"
    if len(user_img) > 50: user_img = user_img[:47] + "..."
    logger.info(f"Request: /generate-video - proposalId: {request.proposalId}, Title: {request.title}, Description: {request.description[:50]}..., UserImage: {user_img}, UserId: {request.user_id}")
    
    # Prioritize user image from DB if user_id is provided
    user_img_for_gemini = request.user_profile_image_url
    if request.user_id:
        db_user = db.query(models.User).filter(models.User.id == request.user_id).first()
        if db_user and db_user.profile_image_url:
            user_img_for_gemini = db_user.profile_image_url
            logger.info(f"Found user in DB, using profile_image_url: {user_img_for_gemini}")

    # 1. Start Image Generation (Async)
    # Extract destination from title or description roughly (or just use full text)
    from app.services.gemini import GeminiService
    from app.services.discovery_engine_service import DiscoveryEngineService
    
    gemini_service = GeminiService()
    discovery_service = DiscoveryEngineService()
    
    # Run image generation concurrently with video logic
    image_task = None
    if user_img_for_gemini:
        image_task = asyncio.create_task(
            gemini_service.generate_travel_image(
                destination=request.title,
                description=request.description,
                user_image_url=user_img_for_gemini,
                user_id=request.user_id
            )
        )

    # 2. Search for Video URLs using Discovery Engine
    # Use both title and description for a better search query if needed
    search_query = f"{request.title} {request.description}"[:200] # Limit query length
    video_task = asyncio.create_task(discovery_service.search_video_urls(search_query))

    # Wait for results
    urls = await video_task
    
    # Fallback to defaults if no results found
    if not urls:
        logger.info("No video URLs found in Discovery Engine, falling back to defaults.")
        urls = [
            "https://www.youtube.com/embed/fL7MEMhFZiQ", # YouTube
            "https://www.instagram.com/reel/DSuBCKcko6F/?utm_source=ig_web_copy_link", # Instagram
            "https://www.tiktok.com/@ochika_map/video/7465649689589746952", # TikTok
        ]
        
    # 3. Await Image Result
    generated_image = None
    if image_task:
        generated_image = await image_task
        
    return {"videoUrls": urls, "generated_image_url": generated_image}

@router.post("/video", response_model=VideoAIResponse)
async def generate_ai_video(request: VideoRequest, current_user: models.User = Depends(get_current_user)):
    """
    Generates a personalized travel video using Veo 3.1 Fast.
    Requires authentication.
    """
    user_img = request.user_profile_image_url or "None"
    if len(user_img) > 50: user_img = user_img[:47] + "..."
    logger.info(f"Request: /video - proposalId: {request.proposalId}, Title: {request.title}, Description: {request.description[:50]}..., UserImage: {user_img}, UserId: {current_user.id}")
    
    # Always prioritize user from authenticated session
    user_img_for_gemini = current_user.profile_image_url or request.user_profile_image_url

    from app.services.gemini import GeminiService
    gemini_service = GeminiService()
    
    video_url = await gemini_service.generate_travel_video(
        destination=request.title,
        description=request.description,
        user_image_url=user_img_for_gemini,
        user_id=current_user.id
    )
    
    return {"video_url": video_url}


class ImageResponse(BaseModel):
    image_urls: List[str]

class ShortsResponse(BaseModel):
    video_urls: List[str]

@router.post("/image", response_model=ImageResponse)
async def generate_image(request: VideoRequest, db: Session = Depends(get_db)):
    """
    Generates 3 vertical (9:16) travel images based on the plan description.
    """
    user_img = request.user_profile_image_url or "None"
    if len(user_img) > 50: user_img = user_img[:47] + "..."
    logger.info(f"Request: /image - proposalId: {request.proposalId}, Title: {request.title}, Description: {request.description[:50]}..., UserImage: {user_img}, UserId: {request.user_id}")
    
    # Prioritize user image from DB if user_id is provided
    user_img_for_gemini = request.user_profile_image_url
    if request.user_id:
        db_user = db.query(models.User).filter(models.User.id == request.user_id).first()
        if db_user and db_user.profile_image_url:
            user_img_for_gemini = db_user.profile_image_url

    if not user_img_for_gemini:
        pass

    from app.services.gemini import GeminiService
    gemini_service = GeminiService()

    image_urls = await gemini_service.generate_travel_images(
        destination=request.title,
        description=request.description,
        user_image_url=user_img_for_gemini,
        user_id=request.user_id
    )
    
    return {"image_urls": image_urls}


@router.post("/shorts", response_model=ShortsResponse)
async def search_shorts(request: VideoRequest):
    """
    Searches for relevant short videos using Discovery Engine.
    """
    logger.info(f"Request: /shorts - proposalId: {request.proposalId}, Title: {request.title}")
    
    from app.services. discovery_engine_service import DiscoveryEngineService
    discovery_service = DiscoveryEngineService()
    
    search_query = f"{request.title} {request.description}"[:200]
    urls = await discovery_service.search_video_urls(search_query)
    
    if not urls:
        logger.info("No video URLs found in Discovery Engine, falling back to defaults.")
        urls = [
            "https://www.youtube.com/embed/fL7MEMhFZiQ",
            "https://www.instagram.com/reel/DSuBCKcko6F/?utm_source=ig_web_copy_link",
            "https://www.tiktok.com/@ochika_map/video/7465649689589746952",
        ]
        
    return {"video_urls": urls}
