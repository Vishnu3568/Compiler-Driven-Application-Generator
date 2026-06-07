# ForgeFlow AI: Compiler-Driven Application Generator

ForgeFlow AI is a production-grade compiler pipeline that transforms natural language requirements into validated, executable application blueprints (comprising UI schemas, API endpoint specs, database migrations, security roles, and business constraints).

---

## ⚡ Key Features

- **Multi-Stage Compiler Pipeline**:
  - **Intent & Assumptions**: Extracts feature intents and generates assumptions for ambiguous prompts.
  - **Architecture Planner**: Maps functional scopes to database tables and services.
  - **Schema Generation**: Formulates schemas for UI, API, DB, Auth, and Business Rules with deterministic ordering.
  - **Cross-Layer Validation**: Asserts multi-layer alignment (e.g. required request fields mapped to database columns).
  - **Intelligent Repair Engine**: Performs targeted corrections on faulty schema layers.
  - **Runtime Simulator**: Emits migration SQL DDL, FastAPI router scripts, Next.js page JSX files, and runs dry-run queries on an in-memory SQLite engine.

- **Developer Dashboard**:
  - **Compilation Flow Visualizer**: Live logs and outputs for every compilation phase.
  - **Schema Editor**: Interactive JSON text editors to alter schemas and trigger revalidation.
  - **Metrics Dashboard**: Telemetry tracking success rate, latencies, repair counts, and individual test reports for all 20 benchmark prompts.

---

## 📂 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── core/            # Environment configurations
│   │   ├── models/          # Pydantic schemas
│   │   ├── services/        # Pipeline stage modules
│   │   └── main.py          # FastAPI server endpoints
│   ├── tests/               # Pytest unit & integration tests
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── app/                 # Next.js 15 routing, console, metrics
│   ├── components/          # Dashboard components
│   ├── tailwind.config.js   # Custom HSL color theme
│   ├── package.json
│   └── Dockerfile
│
├── generated-app/           # Target compile directory (SQL, API, Pages)
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### 🐳 Run with Docker (Recommended)

Start the unified multi-container system:
```bash
docker-compose up --build
```
- Open the dashboard: [http://localhost:3000](http://localhost:3000)
- Inspect the API: [http://localhost:8000/docs](http://localhost:8000/docs)

### 💻 Run Locally

#### 1. Setup Backend
```bash
cd backend
pip install -r requirements.txt
$env:PYTHONPATH="."  # PowerShell
uvicorn app.main:app --reload --port 8000
```

#### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Execute backend test suites to verify validator constraints, repairs, and migrations:
```bash
cd backend
$env:PYTHONPATH="."  # PowerShell
pytest tests/
```
