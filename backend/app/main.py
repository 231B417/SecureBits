from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import auth, dashboard, ai, tokens, ledger, payment, admin

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SecureBits API Pro", version="1.0.0")

# Setup CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(ai.router)
app.include_router(tokens.router)
app.include_router(ledger.router)
app.include_router(payment.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SecureBits Core API"}
# force reload
