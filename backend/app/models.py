from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    
    # Onboarding steps
    onboarding_step = Column(Integer, default=1)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    tx_hash = Column(String, unique=True, index=True)
    type = Column(String, nullable=False) # Top-up, Payout
    amount_inr = Column(Float, nullable=False)
    status = Column(String, default="Completed")
    risk_score = Column(Integer, default=0)
    fraud_flags = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TokenLedger(Base):
    __tablename__ = "token_ledger"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(String, index=True) # End user id masked
    action = Column(String, nullable=False) # Issue, Deduct
    tokens = Column(Float, nullable=False)
    amount_inr_equivalent = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
