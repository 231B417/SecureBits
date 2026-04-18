from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import uuid
from . import models, ledger

def lock_escrow(db: Session, user_id: int, inr_amount: float):
    """Module 6: Escrow hold equivalent."""
    escrow_held = inr_amount * 0.98
    entry = models.EscrowLedger(user_id=user_id, inr_held=escrow_held)
    db.add(entry)
    db.commit()
    return escrow_held

def evaluate_threshold_and_release(db: Session):
    """
    Module 6 / 9: ThresholdEngine and Payout Service.
    Normally runs via Bull at midnight. 
    Aggregates all locked escrow, releases if threshold met, and pushes to payouts table.
    """
    # 1. Fetch all currently locked escrows
    locked_records = db.query(models.EscrowLedger).filter(
        models.EscrowLedger.released_at == None
    ).all()
    
    if not locked_records:
        return {"status": "success", "message": "No pending escrow found.", "payouts_created": 0}
        
    payout_aggregate = {}
    total_released = 0
    now = datetime.utcnow()
    
    # 2. Free funds
    for record in locked_records:
        # Check condition (For MVP, we release everything locked)
        record.released_at = now
        record.inr_released = record.inr_held
        total_released += record.inr_held
        
        # Link user to org for payout
        user = db.query(models.User).filter(models.User.id == record.user_id).first()
        org_id = user.org_id if user else 1
        
        payout_aggregate[org_id] = payout_aggregate.get(org_id, 0) + record.inr_held
        
    # 3. Create Bulk Payouts per Org
    payouts_created = 0
    for org_id, amount in payout_aggregate.items():
        if amount > 0:
            reference = f"bulk_{str(uuid.uuid4())[:8]}"
            new_payout = models.Payout(
                org_id=org_id,
                amount=amount,
                reference=reference,
                status="processed"
            )
            db.add(new_payout)
            
            # Log ESCROW_RELEASE to ledger
            ledger.add_transaction_block(db, {
                "txType": "escrow_release",
                "orgId": org_id,
                "amount": amount,
                "tokenAmount": 0,
                "reference": reference
            })
            payouts_created += 1

    db.commit()
    return {
        "status": "success", 
        "escrow_released_inr": total_released, 
        "payouts_created": payouts_created
    }
