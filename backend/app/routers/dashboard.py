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
    # For MVP, we'll return dynamic mocked metrics if the database is mostly empty, 
    # but the structure mimics exact PRD expectations.
    
    # Normally we'd filter by logged in org_id
    total_rev = 1435000
    tokens_issued = 2870000
    tokens_consumed = 2150400
    active_users = 12450
    fraud_flags = 42
    escrow = 345000
    
    # Generate time series for charts
    today = datetime.now()
    revenue_chart = []
    tokens_chart = []
    fraud_heatmap = []
    
    curr_rev = 100000
    for i in range(30):
        day_date = (today - timedelta(days=(29 - i))).strftime("%Y-%m-%d")
        daily_rev = curr_rev + random.randint(-15000, 25000)
        curr_rev = daily_rev
        revenue_chart.append({"date": day_date, "revenue": max(0, daily_rev)})
        
        daily_issued = random.randint(10000, 50000)
        daily_consumed = max(0, daily_issued - random.randint(-10000, 20000))
        tokens_chart.append({"date": day_date, "issued": daily_issued, "consumed": daily_consumed})
        
        # Heatmap mock data
        if i > 20: 
            fraud_heatmap.append({"date": day_date, "flags": random.randint(0, 10)})
    
    topup_distribution = [
        {"range": "0-100", "count": 450},
        {"range": "101-500", "count": 1200},
        {"range": "501-1000", "count": 850},
        {"range": "1001-5000", "count": 300},
        {"range": "5000+", "count": 50},
    ]
    
    return {
        "metrics": {
            "total_revenue_mtd": { "value": total_rev, "trend": 12.5, "sparkline": generate_mock_sparkline(100, 20) },
            "tokens_issued": { "value": tokens_issued, "trend": 15.2, "sparkline": generate_mock_sparkline(500, 100) },
            "tokens_consumed": { "value": tokens_consumed, "burn_rate": round((tokens_consumed/tokens_issued)*100, 1) if tokens_issued else 0 },
            "active_users": { "value": active_users, "sparkline": generate_mock_sparkline(50, 10) },
            "fraud_flags": { "value": fraud_flags, "high_risk": 12, "medium_risk": 30 },
            "escrow_balance": { "value": escrow, "next_payout": "1st Nov", "threshold_pct": 65 }
        },
        "charts": {
            "revenue_over_time": revenue_chart,
            "token_issuance_vs_consumption": tokens_chart,
            "fraud_heatmap": fraud_heatmap,
            "topup_distribution": topup_distribution
        }
    }
