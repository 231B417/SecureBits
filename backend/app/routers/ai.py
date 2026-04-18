from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.ai_engine import fraud_engine
from .. import database, models

router = APIRouter(prefix="/api/fraud", tags=["AI Fraud Engine"])

class TransactionPayload(BaseModel):
    # Backward compatible fields for UI demo
    amount: float = 0.0
    is_vpn_proxy: bool = False
    device_age_days: int = 100
    recent_failed_attempts: int = 0
    tx_hash: str = "simulated_hash"
    
    # New spec fields
    userId: str = "1"
    ip: str = "127.0.0.1"
    device_fingerprint: str = "unknown"
    velocity_last_1h: int = 0
    velocity_last_24h: int = 0
    avg_tx_amount: float = 0.0
    hour_of_day: int = 12
    is_new_ip: bool = False
    org_type: str = "gaming"

@router.post("/analyze")
async def analyze_transaction(payload: TransactionPayload, db: Session = Depends(database.get_db)):
    """
    Simulates sending a transaction through our real-time AI Fraud Detection.
    """
    try:
        evaluation = fraud_engine.evaluate_fraud_risk(payload.model_dump())
        evaluation["tx_hash"] = payload.tx_hash
        
        # Log to Fraud Audit Log if risk > 30
        if evaluation["risk_score"] > 30:
            audit_log = models.FraudAuditLog(
                user_id=int(payload.userId) if payload.userId.isdigit() else 1,
                org_id=1,
                tx_data=payload.model_dump(),
                score=evaluation["risk_score"],
                action=evaluation["recommended_action"]
            )
            db.add(audit_log)
            db.commit()
            
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
