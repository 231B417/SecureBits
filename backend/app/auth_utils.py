from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from . import models, schemas
import os

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def get_organization_by_email(db: Session, email: str):
    return db.query(models.Organization).filter(models.Organization.email == email).first()

def create_organization(db: Session, org: schemas.OrganizationCreate):
    hashed_password = get_password_hash(org.password)
    db_org = models.Organization(
        company_name=org.company_name,
        email=org.email,
        hashed_password=hashed_password,
        phone=org.phone,
        industry=org.industry
    )
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
