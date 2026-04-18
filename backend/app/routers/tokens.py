from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .. import database, models, ledger
import uuid

router = APIRouter(prefix="/api/tokens", tags=["Token Ledger"])

class TopupRequest(BaseModel):
    amount_inr: float
    user_id: str
    risk_score: int
    
class DeductRequest(BaseModel):
    tokens: float
    user_id: str

@router.post("/topup")
def topup_tokens(request: TopupRequest, db: Session = Depends(database.get_db)):
    """
    Called after AI Firewall passes the transaction.
    Logs Immutable Escrow and Ledger data.
    """
    tokens_credited = request.amount_inr * 2 # Mock conversion rate
    
    # Immutable blockchain mint
    tx_data = {
        "userId": request.user_id,
        "txType": "credit",
        "amount": request.amount_inr,
        "tokenAmount": tokens_credited,
        "previousBalance": "mock",
        "newBalance": "mock"
    }
    block = ledger.add_transaction_block(db, tx_data)
    
    # Gateway Txn Log with Escrow Lock
    escrow_held = request.amount_inr * 0.98
    target_user_id = int(request.user_id) if request.user_id.isdigit() else 1
    
    tx_log = models.Transaction(
        user_id=target_user_id,
        org_id=1,
        type="Top-up",
        token_amount=tokens_credited,
        inr_amount=request.amount_inr,
        escrow_amount=escrow_held,
        fraud_score=request.risk_score,
        block_id=block.index,
        status="On-chain"
    )
    db.add(tx_log)
    db.commit()
    
    return {
        "status": "success",
        "message": "Transaction cleared. Ledger updated. Fiat escrow locked.",
        "tokens_credited": tokens_credited,
        "escrow_held": request.amount_inr * 0.98
    }

@router.post("/deduct")
def deduct_tokens(request: DeductRequest, db: Session = Depends(database.get_db)):
    tx_data = {
        "userId": request.user_id,
        "txType": "debit",
        "amount": -abs(request.tokens / 2),
        "tokenAmount": -abs(request.tokens),
        "previousBalance": "mock", # Normally get from db
        "newBalance": "mock"
    }
    block = ledger.add_transaction_block(db, tx_data)
    
    # Store txn
    target_user_id = int(request.user_id) if request.user_id.isdigit() else 1
    tx_log = models.Transaction(
        user_id=target_user_id, org_id=1, type="Deduct",
        token_amount=-abs(request.tokens), inr_amount=-abs(request.tokens/2),
        block_id=block.index, status="Completed"
    )
    db.add(tx_log)
    db.commit()
    return {"status": "success", "message": "Tokens deducted natively.", "block": block.index}

@router.get("/dashboard/{user_id}")
def user_token_dashboard(user_id: int, db: Session = Depends(database.get_db)):
    # Calculate Token Balance
    txs = db.query(models.Transaction).filter(models.Transaction.user_id == user_id).order_by(models.Transaction.id.desc()).all()
    
    token_balance = 0
    inr_spent = 0
    escrow_held = 0
    
    for tx in txs:
        if tx.status == "On-chain" or tx.status == "Completed":
            token_balance += tx.token_amount
        if tx.type == "Deduct":
            inr_spent += abs(tx.inr_amount)
        if tx.escrow_amount and tx.escrow_amount > 0:
            escrow_held += tx.escrow_amount
            
    history = []
    for tx in txs[:10]:
        history.append({
            "id": tx.id,
            "type": tx.type,
            "token_amount": tx.token_amount,
            "status": tx.status,
            "block_id": tx.block_id,
            "created_at": tx.created_at.isoformat() if tx.created_at else None
        })
        
    return {
        "token_balance": token_balance,
        "spent_this_month": inr_spent, # Mock
        "escrow_held": escrow_held,
        "history": history
    }
