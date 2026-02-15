from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import List, Any
import logging
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import models, schemas
from app.api.endpoints.auth import get_current_user
from app.services import storage
from app.services.bigquery_service import BigQueryService

router = APIRouter()
logger = logging.getLogger(__name__)
bq_service = BigQueryService()

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    # Create a copy or Pydantic model from DB model to modify URL
    user_response = schemas.UserResponse.from_orm(current_user)
    
    # Sign the URL if it is GCS
    if user_response.profile_image_url and user_response.profile_image_url.startswith("gs://"):
        user_response.profile_image_url = storage.generate_signed_url(user_response.profile_image_url)
        
    return user_response

@router.put("/me", response_model=schemas.UserResponse)
async def update_user_me(
    display_name: str = Form(None),
    age: int = Form(None),
    gender: str = Form(None),
    address: str = Form(None),
    indoor_outdoor: str = Form(None),
    hobbies: str = Form(None),
    file: UploadFile = File(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if display_name:
        current_user.display_name = display_name
    if age:
        current_user.age = age
    if gender:
        current_user.gender = gender
    if address:
        current_user.address = address
    if indoor_outdoor:
        current_user.indoor_outdoor = indoor_outdoor
    if hobbies:
        current_user.hobbies = hobbies
    
    if file:
        # Upload image to GCS or Local
        public_url = storage.save_image(
            file.file, 
            file.filename, 
            file.content_type, 
            user_id=current_user.id, 
            folder="profile_img"
        )
        current_user.profile_image_url = public_url
    
    db.commit()
    db.refresh(current_user)
    db.commit()
    db.refresh(current_user)
    
    # Prepare response with signed URL
    user_response = schemas.UserResponse.from_orm(current_user)
    if user_response.profile_image_url and user_response.profile_image_url.startswith("gs://"):
        user_response.profile_image_url = storage.generate_signed_url(user_response.profile_image_url)
        
    return user_response

@router.get("/me/favorites")
async def get_my_favorites(current_user: models.User = Depends(get_current_user)):
    """
    Get current user's favorite plans.
    """
    try:
        favorites = await bq_service.get_favorites(current_user.username)
        return favorites
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/me/favorites")
async def add_to_favorites(plan: schemas.SharePlanRequest, current_user: models.User = Depends(get_current_user)):
    """
    Save a plan snapshot to user's favorites.
    """
    try:
        result = await bq_service.save_plan_to_favorites(plan.dict(), current_user.username)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me/shared")
async def get_my_shared_plans(current_user: models.User = Depends(get_current_user)):
    """
    Get user's shared plans.
    """
    try:
        plans = await bq_service.get_user_shared_plans(current_user.username)
        return plans
    except Exception as e:
        logger.error(f"Error fetching shared plans: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/me/favorites/{fav_id}")
async def delete_favorite(fav_id: str, current_user: models.User = Depends(get_current_user)):
    """
    Delete a plan from favorites.
    """
    success = await bq_service.delete_favorite(fav_id, current_user.username)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete favorite")
    return {"message": "Favorite deleted"}

@router.delete("/me/shared/{plan_id}")
async def delete_shared_plan(plan_id: str, current_user: models.User = Depends(get_current_user)):
    """
    Delete a shared plan.
    """
    success = await bq_service.delete_shared_plan(plan_id, current_user.username)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete shared plan")
    return {"message": "Shared plan deleted"}
