from fastapi import APIRouter, HTTPException, Query
from app.services.bigquery_service import BigQueryService
from app.models.schemas import SearchResultsResponse, SocialPlan, SocialPlanDetail, CommentRequest, CommentResponse
from typing import List, Optional

router = APIRouter()
bq_service = BigQueryService()

@router.get("/plans", response_model=SearchResultsResponse)
async def search_social_plans(
    q: Optional[str] = Query(None, description="Search query"),
    limit: int = 20
):
    """
    Search for travel plans shared by other users.
    """
    try:
        results = await bq_service.search_plans(query=q, limit=limit)
        return SearchResultsResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans/{plan_id}", response_model=SocialPlanDetail)
async def get_plan_detail(plan_id: str):
    """
    Get detailed information about a specific plan.
    """
    plan = await bq_service.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.post("/plans/{plan_id}/like")
async def like_plan(plan_id: str, user_id: str = "test_user"): # In real app, get user_id from auth token
    """
    Like a plan.
    """
    success = await bq_service.add_like(plan_id, user_id)
    if not success:
         return {"message": "Already liked or failed"}
    return {"message": "Liked"}

@router.post("/plans/{plan_id}/comment")
async def comment_on_plan(plan_id: str, request: CommentRequest):
    """
    Add a comment to a plan (Not fully implemented in service yet).
    """
    # Placeholder
    return {"message": "Comment added (simulation)"}
