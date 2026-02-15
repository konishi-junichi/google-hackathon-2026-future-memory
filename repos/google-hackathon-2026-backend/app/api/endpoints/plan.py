from fastapi import APIRouter, Depends, HTTPException
from app.models import models, schemas
from app.models.schemas import (
    TravelProfileRequest, 
    ProposalResponse, 
    ItineraryRequest, 
    ItineraryResponse, 
    PopularTagsResponse, 
    SharePlanRequest,
    BrushUpRequest
)
from app.api.endpoints.auth import get_current_user
from app.services.gemini import GeminiService
from app.services.bigquery_service import BigQueryService
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
gemini_service = GeminiService()
bq_service = BigQueryService()

@router.get("/tags", response_model=PopularTagsResponse)
async def get_popular_tags():
    """
    Get a list of popular travel tags.
    """
    # In a real app, this might come from a DB or AI. 
    # For now, fixed list.
    return PopularTagsResponse(tags=[
        "歴史巡り", "グルメ", "絶景", "隠れ家", "温泉", 
        "アート", "写真映え", "ローカル体験", "散策", "伝統文化"
    ])

@router.post("/proposals", response_model=List[ProposalResponse])
async def create_travel_proposals(request: TravelProfileRequest):
    """
    Generate travel proposals based on user profile.
    """
    logger.info(f"Request: /proposals - Mode: {request.mode}, Tags: {request.selected_tags}, Lang: {request.language}")
    try:
        proposals = await gemini_service.generate_proposals(
            mode=request.mode, 
            language=request.language,
            selected_tags=request.selected_tags,
            custom_attributes=request.custom_attributes,
            nights=request.nights,
            departure_location=request.departure_location
        )
        return proposals
    except Exception as e:
        logger.error(f"Error in /proposals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/itinerary", response_model=ItineraryResponse)
async def create_itinerary(request: ItineraryRequest):
    """
    Generate a detailed itinerary for a selected proposal.
    """
    logger.info(f"Request: /itinerary - ID: {request.proposalId}, Title: {request.title}")
    try:
        itinerary = await gemini_service.generate_itinerary(request.proposalId, request.title, request.language, request.nights)
        return itinerary
    except Exception as e:
        logger.error(f"Error in /itinerary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/share")
async def share_plan(request: SharePlanRequest, current_user: models.User = Depends(get_current_user)):
    """
    Share a travel plan to the public (BigQuery).
    """
    logger.info(f"Request: /share - Title: {request.title}")
    try:
        # TODO: Implement duplicate check logic here using Gemini
        # For now, just insert.
        
        # Convert request to dict for BQ service
        plan_data = request.dict()
        
        # User ID from authenticated session
        user_id = current_user.username
        
        # Check for duplicate
        # Call share_plan (renamed/updated insert_plan)
        result = await bq_service.share_plan(plan_data, user_id)
        return result
    except Exception as e:
        logger.error(f"Error in /share: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/brushup", response_model=ItineraryResponse)
async def brush_up_plan(request: BrushUpRequest):
    """
    Brush up an existing itinerary based on user request.
    """
    logger.info(f"Request: /brushup - ID: {request.proposalId}, Request: {request.request}")
    try:
        new_itinerary = await gemini_service.brush_up_itinerary(
            request.current_itinerary.dict(), 
            request.request, 
            request.history
        )
        
        # Enforce preservation of critical fields (ID and Title)
        # The AI might hallucinate a new ID or Title, so we must overwrite them with the original values.
        new_itinerary['proposalId'] = request.proposalId
        # We might want to allow title changes if the user specifically asked for it, 
        # but for safety regarding "identity" of the plan, we should probably keep it or at least track it.
        # However, the user request specifically mentioned "plan ID". 
        # Let's preserve the ID strictly.
        
        return new_itinerary
    except Exception as e:
        logger.error(f"Error in /brushup: {e}")
        raise HTTPException(status_code=500, detail=str(e))
