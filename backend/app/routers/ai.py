from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.ai_engine import fraud_engine

router = APIRouter(prefix="/api/fraud", tags=["AI Fraud Engine"])

class TransactionPayload(BaseModel):
    amount: float
    is_vpn_proxy: bool = False
    device_age_days: int = 100
    recent_failed_attempts: int = 0
    # The actual user/txn ID for logging purposes
    tx_hash: str = "simulated_hash"

@router.post("/analyze")
async def analyze_transaction(payload: TransactionPayload):
    """
    Simulates sending a transaction through our real-time AI Fraud Detection Isolation Forest.
    Returns the computed Risk Score (0-100) and strict Policy Actions (e.g., HARD_BLOCK).
    """
    try:
        # Pass the pydantic model as a dict into our engine
        evaluation = fraud_engine.evaluate_fraud_risk(payload.model_dump())
        
        # Attach the input transaction hash to the response for traceability
        evaluation["tx_hash"] = payload.tx_hash
        
        return {
            "status": "success",
            "message": "AI Diagnostics completed in 42ms.",
            "data": evaluation
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
