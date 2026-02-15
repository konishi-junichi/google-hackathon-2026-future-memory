from fastapi import APIRouter
from app.models.schemas import SearchPlansRequest, SearchResultsResponse, PlanSummary
import logging
from typing import List

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/plans", response_model=SearchResultsResponse)
async def search_plans(request: SearchPlansRequest):
    """
    Mock endpoint for searching travel plans via Vertex AI Search.
    """
    logger.info(f"Mock Request: /search/plans - Query: {request.query}")
    
    # Mock response data based on the query
    mock_results = [
        PlanSummary(
            plan_id="plan-001",
            title="早朝の清水寺と東山散策",
            description="混雑を避けるため、朝6時の開門に合わせて清水寺を訪れる静かなルートです。",
            match_reason="「歴史」と「静寂」の条件に一致しました",
            thumbnail="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&q=80",
            tags=["歴史", "朝活", "静か"],
            author="Kyoto_Traveler"
        ),
        PlanSummary(
            plan_id="plan-002",
            title="嵐山の竹林と天龍寺の庭園",
            description="竹林の小径を抜け、世界遺産・天龍寺の美しい庭園を鑑賞する定番コースです。",
            match_reason="「自然」と「景色」の条件に一致しました",
            thumbnail="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=500&q=80",
            tags=["自然", "フォトスポット"],
            author="PhotoMaster"
        )
    ]
    
    # Simple filtering simulation
    if request.filter and request.filter.mode == "senior":
        # In a real app, this would filter. For mock, we just log it.
        logger.info("Filtering for senior mode")

    return SearchResultsResponse(results=mock_results)
