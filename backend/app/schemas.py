from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class OrganizationCreate(BaseModel):
    company_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    industry: Optional[str] = None

    class Config:
        from_attributes = True

class OrganizationResponse(BaseModel):
    id: int
    company_name: str
    email: EmailStr
    onboarding_step: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
