from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import random

from .. import models
from ..database import get_db

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)

def generate_mock_sparkline(base_val, fluctuations, days=7):
    return [max(0, base_val + random.randint(-fluctuations, fluctuations)) for _ in range(days)]

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    # 1. Real Database Aggregations
    total_rev_row = db.query(func.sum(models.Transaction.inr_amount)).filter(models.Transaction.type == "Top-up").first()
    total_rev = total_rev_row[0] if total_rev_row[0] else 0
    
    tokens_issued_row = db.query(func.sum(models.Transaction.token_amount)).filter(models.Transaction.type == "Top-up").first()
    tokens_issued = tokens_issued_row[0] if tokens_issued_row[0] else 0
    
    tokens_consumed_row = db.query(func.sum(models.Transaction.token_amount)).filter(models.Transaction.type == "Deduct").first()
    tokens_consumed = abs(tokens_consumed_row[0]) if tokens_consumed_row[0] else 0
    
    active_users = db.query(func.count(func.distinct(models.Transaction.user_id))).scalar()
    
    fraud_flags = db.query(func.count(models.Transaction.id)).filter(models.Transaction.fraud_score > 70).scalar()
    
    escrow_row = db.query(func.sum(models.Transaction.escrow_amount)).first()
    escrow = escrow_row[0] if escrow_row[0] else 0
    
    # Generate time series for charts (Mixing a bit of mock for better visual flow in demo)
    today = datetime.now()
    revenue_chart = []
    tokens_chart = []
    
    # Base mock history for visual "context"
    for i in range(25):
        day_date = (today - timedelta(days=(29 - i))).strftime("%Y-%m-%d")
        revenue_chart.append({"date": day_date, "revenue": random.randint(50000, 150000)})
        tokens_chart.append({"date": day_date, "issued": random.randint(20000, 40000), "consumed": random.randint(15000, 35000)})

    # Real data for the last 5 days
    for i in range(25, 30):
        day_date = (today - timedelta(days=(29 - i))).strftime("%Y-%m-%d")
        # For simplicity in hackathon, we'll just add the current total to the 'today' slot
        if i == 29:
             revenue_chart.append({"date": day_date, "revenue": total_rev})
             tokens_chart.append({"date": day_date, "issued": tokens_issued, "consumed": tokens_consumed})
        else:
             revenue_chart.append({"date": day_date, "revenue": random.randint(100000, 200000)})
             tokens_chart.append({"date": day_date, "issued": random.randint(30000, 50000), "consumed": random.randint(20000, 40000)})
    
    topup_distribution = [
        {"range": "0-200", "count": db.query(func.count(models.Transaction.id)).filter(models.Transaction.inr_amount <= 200).scalar()},
        {"range": "201-500", "count": db.query(func.count(models.Transaction.id)).filter(models.Transaction.inr_amount > 200, models.Transaction.inr_amount <= 500).scalar()},
        {"range": "501-1000", "count": db.query(func.count(models.Transaction.id)).filter(models.Transaction.inr_amount > 500, models.Transaction.inr_amount <= 1000).scalar()},
        {"range": "1000+", "count": db.query(func.count(models.Transaction.id)).filter(models.Transaction.inr_amount > 1000).scalar()},
    ]
    
    return {
        "metrics": {
            "total_revenue_mtd": { "value": total_rev, "trend": 12.5, "sparkline": generate_mock_sparkline(100, 20) },
            "tokens_issued": { "value": tokens_issued, "trend": 15.2, "sparkline": generate_mock_sparkline(500, 100) },
            "tokens_consumed": { "value": tokens_consumed, "burn_rate": round((tokens_consumed/tokens_issued)*100, 1) if tokens_issued else 0 },
            "active_users": { "value": active_users, "sparkline": generate_mock_sparkline(50, 10) },
            "fraud_flags": { "value": fraud_flags, "high_risk": fraud_flags, "medium_risk": 0 },
            "escrow_balance": { "value": escrow, "next_payout": "1st Nov", "threshold_pct": 65 }
        },
        "charts": {
            "revenue_over_time": revenue_chart,
            "token_issuance_vs_consumption": tokens_chart,
            "topup_distribution": topup_distribution
        }
    }

@router.get("/transactions")
def get_recent_transactions(db: Session = Depends(get_db)):
    txs = db.query(models.Transaction).order_by(models.Transaction.id.desc()).limit(20).all()
    return txs

@router.get("/users")
def get_org_users(db: Session = Depends(get_db)):
    """Return all users in the system with their balance and transaction summary"""
    users = db.query(models.User).all()
    result = []
    for user in users:
        total_topup = db.query(func.sum(models.Transaction.inr_amount)).filter(
            models.Transaction.user_id == user.id,
            models.Transaction.type == "Top-up"
        ).scalar() or 0

        fraud_count = db.query(func.count(models.Transaction.id)).filter(
            models.Transaction.user_id == user.id,
            models.Transaction.fraud_score > 60
        ).scalar() or 0

        tx_count = db.query(func.count(models.Transaction.id)).filter(
            models.Transaction.user_id == user.id
        ).scalar() or 0

        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "tier": user.tier,
            "token_balance": user.token_balance,
            "total_spent_inr": total_topup,
            "tx_count": tx_count,
            "fraud_flags": fraud_count,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        })
    return result

@router.get("/users/{user_id}/history")
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    """Return payment, token, and fraud history for a specific user"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")

    # Payment history = top-ups
    payments = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.type == "Top-up"
    ).order_by(models.Transaction.id.desc()).all()

    # Token usage = deductions
    token_usage = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.type == "Deduct"
    ).order_by(models.Transaction.id.desc()).all()

    # Fraud events = any tx with fraud_score > 50
    fraud_events = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.fraud_score > 50
    ).order_by(models.Transaction.fraud_score.desc()).all()

    def serialize_tx(tx):
        return {
            "id": tx.id,
            "type": tx.type,
            "inr_amount": tx.inr_amount,
            "token_amount": tx.token_amount,
            "fraud_score": tx.fraud_score,
            "fraud_action": tx.fraud_action,
            "status": tx.status,
            "block_id": tx.block_id,
            "created_at": tx.created_at.isoformat() if tx.created_at else None,
        }

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "tier": user.tier,
            "token_balance": user.token_balance,
        },
        "payment_history": [serialize_tx(tx) for tx in payments],
        "token_history": [serialize_tx(tx) for tx in token_usage],
        "fraud_history": [serialize_tx(tx) for tx in fraud_events],
    }
