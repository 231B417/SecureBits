from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from pydantic import BaseModel
from jose import JWTError, jwt
from typing import Union, Optional
from .. import database, schemas, models, auth_utils

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_identity(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth_utils.jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        email: str = payload.get("sub")
        identity_type: str = payload.get("type")
        if email is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    if identity_type == "org":
        org = auth_utils.get_organization_by_email(db, email=email)
        if org is None:
            raise credentials_exception
        return {"type": "org", "data": org}
    else:
        user = auth_utils.get_user_by_email(db, email=email)
        if user is None:
            raise credentials_exception
        return {"type": "user", "data": user}

@router.post("/register", response_model=schemas.OrganizationResponse)
def register(org: schemas.OrganizationCreate, db: Session = Depends(database.get_db)):
    db_org = auth_utils.get_organization_by_email(db, email=org.email)
    if db_org:
        raise HTTPException(status_code=400, detail="Email already registered")
    return auth_utils.create_organization(db=db, org=org)

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth_utils.get_organization_by_email(db, email=form_data.username)
    if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_utils.create_access_token(
        data={"sub": user.email, "type": "org"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/user/register")
def user_register(user: schemas.UserSignup, db: Session = Depends(database.get_db)):
    db_user = auth_utils.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    auth_utils.create_user(db=db, user=user)
    return {"status": "success", "message": "User registered successfully"}

@router.post("/user/login", response_model=schemas.Token)
def user_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth_utils.get_user_by_email(db, email=form_data.username)
    if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_utils.create_access_token(
        data={"sub": user.email, "type": "user"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_me(identity: dict = Depends(get_current_identity)):
    """Fetch current user/org profile for dashboard header/settings"""
    type_ = identity["type"]
    data = identity["data"]
    
    if type_ == "org":
        return {
            "type": "org",
            "name": data.name,
            "email": data.email,
            "id": data.id
        }
    else:
        return {
            "type": "user",
            "id": data.id,
            "name": data.name,
            "email": data.email,
            "phone": data.phone,
            "tier": data.tier,
            "token_balance": data.token_balance
        }

class ProfileUpdate(BaseModel):
    name: str
    phone: str
    email: str

@router.post("/update")
def update_profile(data: ProfileUpdate, identity: dict = Depends(get_current_identity), db: Session = Depends(database.get_db)):
    """Update current user/org profile"""
    if identity["type"] == "org":
         obj = identity["data"]
         obj.name = data.name
         obj.email = data.email
    else:
         obj = identity["data"]
         obj.name = data.name
         obj.phone = data.phone
         obj.email = data.email
    
    db.commit()
    return {"status": "success", "message": "Profile updated."}

class OTPSendRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str

@router.post("/otp/send")
def send_otp(request: OTPSendRequest, db: Session = Depends(database.get_db)):
    import random
    otp_code = str(random.randint(100000, 999999))
    print(f"\n\n[TWILIO SIMULATOR] Sending SMS to {request.phone} -> OTP: {otp_code}\n\n")
    
    new_otp = models.OTPLog(
        user_id=1, # Default for OTP simulation in demo
        otp_hash=auth_utils.get_password_hash(otp_code),
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )
    db.add(new_otp)
    db.commit()
    return {"status": "success", "message": f"OTP sent to {request.phone}"}

@router.post("/otp/verify")
def verify_otp(request: OTPVerifyRequest, db: Session = Depends(database.get_db)):
    if request.otp == "123456" or request.otp == "381234":
        return {"status": "success", "session_token": "mock_session_token_999"}
    return {"status": "success", "session_token": "verified_session_token"}

@router.post("/oauth/google")
def google_login(db: Session = Depends(database.get_db)):
    access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_utils.create_access_token(
        data={"sub": "google_user@gmail.com", "type": "user"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "mock": True}
