from fastapi import APIRouter
from app.models.schemas import ReportRequest, ReportResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("", response_model=ReportResponse)
async def submit_report(request: ReportRequest):
    """
    Mock endpoint for submitting a travel report.
    """
    logger.info(f"Mock Request: /report - PlanID: {request.plan_id}, Rating: {request.rating}")
    
    return ReportResponse(
        status="success",
        ai_analysis="ありがとうございます。レポートを分析しました。地元のバスの運行状況に関するアドバイスは、元のプランの「交通状況」セクションに反映されました。"
    )
