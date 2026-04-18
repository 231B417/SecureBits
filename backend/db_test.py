from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    txs = db.query(models.Transaction).filter(models.Transaction.user_id == 1).order_by(models.Transaction.id.desc()).all()
    print([tx.id for tx in txs])
except Exception as e:
    print("FAILED:", type(e).__name__, str(e))
