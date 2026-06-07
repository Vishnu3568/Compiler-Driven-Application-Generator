# ForgeFlow AI: Compiler-Driven Application Generator

ForgeFlow AI is a compiler-like software generation engine. It transforms natural language requirements into validated, executable application configurations comprising UI schemas, API endpoint specs, database migrations, security roles, and business constraints, and executes them in a simulated runtime sandbox.

---

## ⚡ Key Features

- **Multi-Stage Compiler Pipeline**:
  - **Intent & Assumptions (Stage 1)**: Extracts functional intent, user roles, and logs logical assumptions for ambiguous prompts.
  - **Architecture Planner (Stage 2)**: Maps intents into application architectures (Entities, Pages, and Services).
  - **Schema Generation (Stage 3)**: Formulates JSON schemas for UI, API, DB, Auth, and Business Rules with deterministic ordering.
  - **Cross-Layer Validation (Stage 4)**: Performs type matching and cross-dependency validation (e.g. required request fields mapped to database columns, UI components bound to active endpoints).
  - **Intelligent Repair Engine (Stage 5)**: Automatically repairs validation anomalies by targeting and regenerating only the faulty schema layer.
  - **Runtime Simulator (Stage 6)**: Outputs SQL migration files, FastAPI endpoint modules, Next.js page components, and runs migrations on an in-memory **SQLite sandbox database** to guarantee deployability.

- **Developer Dashboard**:
  - **Compilation Flow Visualizer**: Tracks live logs, execution steps, and assumptions in real-time.
  - **Schema Editor & Explorer**: Interactive JSON configs where users can modify schemas and trigger re-simulations.
  - **Metrics Dashboard**: Plots latency, success rates, and repairs across the 20 benchmark prompts.

---

## 📂 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── core/            # Configs and settings
│   │   ├── models/          # Pydantic schemas (validates UI, API, DB, Auth configs)
│   │   ├── services/        # Agents: extractor, planner, generator, validator, repairer, simulator, evaluator
│   │   └── main.py          # FastAPI web server and routing
│   ├── tests/               # Pytest suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── app/                 # Next.js 15 routing, layout, styling, and charts
│   ├── components/          # Dashboard components
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Local Getting Started

### 🐳 Run with Docker (Recommended)
From the project root:
```bash
docker-compose up --build
```
* **Dashboard**: [http://localhost:3000](http://localhost:3000)
* **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 💻 Run Locally

#### 1. Start the Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
# On PowerShell:
$env:PYTHONPATH="."
# On CMD:
set PYTHONPATH=.

uvicorn app.main:app --reload --port 8000
```

#### 2. Start the Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

Run backend tests verifying type safety, SQL simulations, and cross-layer validators:
```bash
cd backend
# On PowerShell:
$env:PYTHONPATH="."
# On CMD:
set PYTHONPATH=.

pytest tests/
```

---

## ☁️ Production Cloud Deployment

### 1. Backend Deployment (e.g. Render, Railway, or Fly.io)
1. Set the root directory to `backend`.
2. Install dependencies via `pip install -r requirements.txt`.
3. Launch with `uvicorn app.main:app --host 0.0.0.0 --port 10000`.
4. Add environment variables:
   * `PYTHONPATH` = `.`
   * *(Optional)* `OPENAI_API_KEY` = `your_key` (omitting defaults to local mock compilation fallback).

### 2. Frontend Deployment (Vercel)
1. Create a new project pointing to your GitHub repository.
2. Set the root directory to `frontend`.
3. Set the build environment variable:
   * **`NEXT_PUBLIC_API_URL`**: *Your deployed FastAPI backend URL* (e.g. `https://forgeflow-backend.onrender.com`).
4. Click **Deploy**.
