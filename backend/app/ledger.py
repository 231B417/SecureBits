import hashlib
import json
from datetime import datetime
from sqlalchemy.orm import Session
from . import models

def calculate_hash(index: int, timestamp: str, data: dict, previous_hash: str) -> str:
    """Calculate SHA-256 hash for a block based on its contents."""
    data_string = json.dumps(data, sort_keys=True)
    val = f"{index}{timestamp}{data_string}{previous_hash}"
    return hashlib.sha256(val.encode('utf-8')).hexdigest()

def get_latest_block(db: Session):
    """Retrieve the most recent block from the ledger."""
    return db.query(models.LedgerBlock).order_by(models.LedgerBlock.index.desc()).first()

def ensure_genesis_block(db: Session):
    """Create the Genesis block if the ledger is completely empty."""
    latest = get_latest_block(db)
    if not latest:
        genesis_data = {"message": "TokenPay Genesis Block"}
        genesis_timestamp = datetime.utcnow().isoformat()
        genesis_hash = calculate_hash(0, genesis_timestamp, genesis_data, "0")
        
        genesis_block = models.LedgerBlock(
            index=0,
            hash=genesis_hash,
            previous_hash="0",
            data=genesis_data,
            timestamp=genesis_timestamp
        )
        db.add(genesis_block)
        db.commit()
        db.refresh(genesis_block)
        return genesis_block
    return latest

def add_transaction_block(db: Session, tx_data: dict):
    """
    Append a new immutable transaction block to the ledger.
    tx_data should be a JSON-serializable dictionary.
    """
    latest_block = get_latest_block(db)
    if not latest_block:
        latest_block = ensure_genesis_block(db)
        
    new_index = latest_block.index + 1
    new_timestamp = datetime.utcnow().isoformat()
    new_hash = calculate_hash(new_index, new_timestamp, tx_data, latest_block.hash)
    
    new_block = models.LedgerBlock(
        index=new_index,
        hash=new_hash,
        previous_hash=latest_block.hash,
        data=tx_data,
        timestamp=new_timestamp
    )
    db.add(new_block)
    db.commit()
    db.refresh(new_block)
    return new_block

def verify_chain(db: Session):
    """
    Iterate over the entire ledger table to mathematically prove chain integrity.
    Returns { valid: bool, brokenAtIndex: int or None }
    """
    blocks = db.query(models.LedgerBlock).order_by(models.LedgerBlock.index.asc()).all()
    
    for i in range(1, len(blocks)):
        current_block = blocks[i]
        previous_block = blocks[i-1]
        
        # 1. Check if previous_hash correctly points to the actual previous block's hash
        if current_block.previous_hash != previous_block.hash:
            return {"valid": False, "brokenAtIndex": current_block.index}
            
        # 2. Recalculate hash of current block and verify it hasn't been tampered with
        recalculated_hash = calculate_hash(
            current_block.index,
            current_block.timestamp,
            current_block.data,
            current_block.previous_hash
        )
        
        if current_block.hash != recalculated_hash:
             return {"valid": False, "brokenAtIndex": current_block.index}
             
    return {"valid": True, "brokenAtIndex": None}
