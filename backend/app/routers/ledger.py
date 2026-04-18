from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, ledger

router = APIRouter(prefix="/api/ledger", tags=["Immutable Ledger"])

@router.get("/verify")
def verify_blockchain(db: Session = Depends(database.get_db)):
    """
    Cryptographically verify the integrity of the TokenPay ledger.
    """
    ledger.ensure_genesis_block(db)
    result = ledger.verify_chain(db)
    return result

@router.get("/block/{index}")
def get_block(index: int, db: Session = Depends(database.get_db)):
    """Retrieve a specific block by its index."""
    block = db.query(models.LedgerBlock).filter(models.LedgerBlock.index == index).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    return {
        "index": block.index,
        "hash": block.hash,
        "previous_hash": block.previous_hash,
        "data": block.data,
        "timestamp": block.timestamp
    }
