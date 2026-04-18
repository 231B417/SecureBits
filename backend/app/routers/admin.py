from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, escrow

router = APIRouter(prefix="/api/admin", tags=["Admin Services"])

@router.post("/cron/trigger-payouts")
def trigger_escrow_payouts(db: Session = Depends(database.get_db)):
    """
    Hackathon helper: Manually trigger the midnight "ThresholdEngine" CRON job.
    Releases all pending 98% escrows and generates Payout bulk payloads.
    """
    result = escrow.evaluate_threshold_and_release(db)
    return result

@router.get("/fraud-log")
def get_fraud_logs(db: Session = Depends(database.get_db)):
    """Module 8: View all flagged/blocked transaction attempts."""
    logs = db.query(models.FraudAuditLog).order_by(models.FraudAuditLog.id.desc()).all()
    return {"logs": logs}

@router.post("/fraud-log/{log_id}/resolve")
def resolve_fraud_log(log_id: int, db: Session = Depends(database.get_db)):
    """Module 8: Mark a flagged transaction as reviewed/resolved by Admin."""
    log = db.query(models.FraudAuditLog).filter(models.FraudAuditLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")
        
    from datetime import datetime
    log.resolved_at = datetime.utcnow()
    log.resolved_by = "Admin_RK"
    log.action = "OVERRIDDEN_ALLOW"
    db.commit()
    
    return {"status": "success", "message": "Transaction cleared manually."}

@router.post("/reset-db")
def reset_database():
    """Hackathon utility to forcefully drop and recreate all SQL schema dynamically"""
    models.Base.metadata.drop_all(bind=database.engine)
    models.Base.metadata.create_all(bind=database.engine)
    
    # Pre-seed User
    db = database.SessionLocal()
    try:
        org = models.Organization(name="Default Org", email="admin@org.com", hashed_password="mock")
        db.add(org)
        db.commit()
        
        user = models.User(name="Rahul Kumar", phone="9988776655", org_id=org.id)
        db.add(user)
        db.commit()
    except Exception as e:
        pass
    finally:
        db.close()
        
    return {"status": "success", "message": "Database wiped and schema recreated."}
