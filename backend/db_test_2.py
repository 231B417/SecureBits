from app.database import SessionLocal
from app.routers import tokens
from app.models import Transaction

db = SessionLocal()
try:
    req = tokens.TopupRequest(amount_inr=500.0, user_id="1", risk_score=10)
    res = tokens.topup_tokens(req, db)
    print("SUCCESS", res)
except Exception as e:
    print("ERROR:", type(e).__name__, str(e))
    import traceback
    traceback.print_exc()
