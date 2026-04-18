from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean, JSON
from sqlalchemy.sql import func
from .database import Base

class Organization(Base):
    __tablename__ = "orgs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=True) # e.g., gaming_org
    bank_account = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    org_id = Column(Integer, ForeignKey("orgs.id"), nullable=False, default=1)
    tier = Column(String, default="Standard") # Premium
    token_balance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    org_id = Column(Integer, ForeignKey("orgs.id"), nullable=False)
    type = Column(String, nullable=False) # credit or debit
    token_amount = Column(Float, nullable=False)
    inr_amount = Column(Float, nullable=False)
    escrow_amount = Column(Float, default=0.0)
    escrow_release_date = Column(DateTime(timezone=True), nullable=True)
    fraud_score = Column(Integer, default=0)
    fraud_action = Column(String, default="allow")
    block_id = Column(Integer, nullable=True) # foreign key references ledger_blocks index
    status = Column(String, default="completed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LedgerBlock(Base):
    __tablename__ = "ledger_blocks"
    index = Column(Integer, primary_key=True, index=True)
    hash = Column(String, unique=True, nullable=False)
    previous_hash = Column(String, nullable=False)
    data = Column(JSON, nullable=False)
    timestamp = Column(String, nullable=False)

class FraudAuditLog(Base):
    __tablename__ = "fraud_audit_log"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    org_id = Column(Integer, ForeignKey("orgs.id"), nullable=False)
    tx_data = Column(JSON, nullable=False)
    score = Column(Integer, nullable=False)
    action = Column(String, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String, nullable=True)

class EscrowLedger(Base):
    __tablename__ = "escrow_ledger"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    inr_held = Column(Float, default=0.0)
    inr_released = Column(Float, default=0.0)
    locked_at = Column(DateTime(timezone=True), server_default=func.now())
    released_at = Column(DateTime(timezone=True), nullable=True)

class Payout(Base):
    __tablename__ = "payouts"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("orgs.id"), nullable=False)
    amount = Column(Float, nullable=False)
    reference = Column(String, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OTPLog(Base):
    __tablename__ = "otp_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    otp_hash = Column(String, nullable=False)
    tx_session = Column(JSON, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False)
