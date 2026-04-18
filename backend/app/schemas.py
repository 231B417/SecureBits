from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# ORG SCHEMAS
class OrganizationCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    type: Optional[str] = "gaming_org"
    bank_account: Optional[str] = None

    class Config:
        from_attributes = True

class OrganizationResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    type: Optional[str]

    class Config:
        from_attributes = True

# USER SCHEMAS
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    org_id: Optional[int] = 1

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    name: str
    phone: str
    org_id: int
    email: Optional[EmailStr] = None
    tier: Optional[str] = "Standard"

class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    org_id: int
    tier: str
    token_balance: float

    class Config:
        from_attributes = True

# TOKEN SCHEMAS
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
