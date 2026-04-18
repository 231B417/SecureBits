# TokenPay Project Handoff Document

> **Note to AI / new agent session:** This document serves as a direct status report on the **TokenPay** codebase. Always read this file to understand the current progress, architectural decisions, and the immediate next steps aligned with the PRD.

## 1. Project Context
**TokenPay** is a B2B SaaS payment infrastructure platform designed to eliminate per-transaction gateway fees via a token-based prepaid credit model backed by blockchain escrow and real-time AI fraud detection.

## 2. Tech Stack Setup & Architecture
- **Monorepo Structure**: The overall project lives in `d:\RAGHAV\CodeSrijan\`. 
  - `frontend/`: React 19 application utilizing standard DOM routing, bundled by Vite, written in TypeScript. 
  - `backend/`: Python backend powered by FastAPI using SQLAlchemy.
- **Infrastructure adjustments**: All previous Docker containers and Supabase instances have been explicitly removed by the user in favor of local lightweight setups (SQLite bindings used under `models.py`).

## 3. Work Completed So Far

### Backend (`/backend`)
- **FastAPI Core**: Minimal main initialization completed. CORS configured for `localhost:5173 / 5174`.
- **Database Models**: `models.py` defines the base `Organization` schema, `Transaction`, and `TokenLedger` models to support escrow metrics.
- **AI Fraud Engine Simulation (`ai_engine.py`)**: Designed an active heuristic Python class that calculates incoming `fraud_risk` vectors (IP, Age, Velocity checks) and returns strict policy actions (`PASS`, `REQUIRE_OTP`, `HARD_BLOCK`).
- **Dashboard APIs`: Created `dashboard.py` to aggregate Recharts metrics. 

### Frontend (`/frontend`)
- **Organization Onboarding Flow**: Implemented a **4-step UI Wizard**.
- **Complete SaaS Dashboard**: Rewritten to eliminate ALL placeholder states. `Dashboard.tsx` utilizes `activeTab` rendering to flawlessly switch between 10 customized tabs (`Token Analytics`, `Users`, `Payouts Schedule`, `Transactions Ledger`, `Fraud Monitor`, etc.). Beautifully styled with a consistent glassmorphism theme and `Recharts` data visualization.
- **End-user Checkout Widget (`/checkout`)**: Developed a standalone mockup of a video game storefront utilizing the TokenPay plugin. 
  - Connected the UI "Pay" button to the Backend `POST /api/fraud/analyze` endpoint.
  - Generates an active, intercepting **Secure OTP Modal** if the AI backend detects malicious transaction vectors.

## 4. Current State & Testing Instructions
Both servers are actively configured to run in standard development mode:
- **API Server Environment**: Needs `uvicorn app.main:app --reload` wrapped under `venv`. Serves via `http://localhost:8000`.
- **UI Engine**: Triggers via `npm run dev` in the `frontend` folder. Serves via `http://localhost:5174`.

## 5. Next Immediate Steps (Phase 2 Priorities)

We have perfectly executed the Dashboard UI, the AI heuristic scaffolding, and the Mock Checkout OTP interjection. 

To elevate this to a pristine, hackathon-winning architecture, the user dictates the following objectives for the next AI session:

1. **Genuine ML Model Training (AI Fraud Engine Override):** 
   Replace the hardcoded heuristics in `ai_engine.py` with actual Machine Learning inference.
   - You must write a script (`train_model.py`) that uses `scikit-learn` to generate 10,000 synthetic transaction records mapping the exact signals (amount, velocity, age, ip_match).
   - Train a `RandomForestClassifier` (or XGBoost if compatible) on this data.
   - Save the artifact (`fraud_model.pkl`) to the backend.
   - Update `ai_engine.py` to load this model at startup and perform real tensor predictions on the incoming payloads.
   - Re-align the risk bands directly to the user's mindmap blueprint: `0-30` (Allow), `31-60` (Allow + Flag), `61-80` (Require OTP), `81-100` (Hard Block).

2. **Core Token Engine Integration & Escrow Ledger:** 
   Execute the strict backend endpoints proposed in the architecture:
   - Build `POST /api/tokens/topup` and `POST /api/tokens/deduct` in `routers/tokens.py`.
   - Update the `models.py` logic to accurately simulate the **Escrow Lock** timeline before paying out unutilized tokens to developers.

**Welcome to the session! To process these tickets, please read the implementation plan laid out above.**
