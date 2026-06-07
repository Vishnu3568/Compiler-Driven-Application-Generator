import os
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.core.config import settings
from app.models.schemas import Blueprint, ValidationReport
from app.services.orchestrator import Orchestrator
from app.services.evaluator import EvaluationFramework
from app.services.runtime_simulator import RuntimeSimulator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("forgeflow")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Compiler-driven application blueprint generator engine",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    settings: Optional[Dict[str, Any]] = None

class SimulationRequest(BaseModel):
    ui_schema: Dict[str, Any]
    api_schema: Dict[str, Any]
    db_schema: Dict[str, Any]
    auth_schema: Dict[str, Any]
    business_rules: Dict[str, Any]
    validation_report: Dict[str, Any]

@app.get("/")
def read_root():
    return {"status": "online", "service": "ForgeFlow AI Compiler Engine"}

@app.get("/healthz")
def health_check():
    return {"status": "healthy"}

@app.post("/api/generate", response_model=Blueprint)
async def generate_blueprint(request: GenerateRequest):
    """
    Compiler endpoint: processes prompt input and outputs validated,
    simulated application blueprints.
    """
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt must not be empty.")
    
    try:
        logger.info(f"Processing generation request: '{request.prompt[:50]}...'")
        blueprint = Orchestrator.compile_app(request.prompt, request.settings)
        return blueprint
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.get("/api/prompts")
def list_prompts():
    """Retrieve list of preconfigured evaluation prompts."""
    return EvaluationFramework.get_prompts()

@app.get("/api/metrics")
def get_metrics():
    """Retrieve historical or cached evaluation metrics."""
    return EvaluationFramework.get_latest_results()

@app.post("/api/evaluate")
def run_evaluation(background_tasks: BackgroundTasks):
    """Trigger the 20-prompt evaluation framework asynchronously."""
    # Since evaluation can take a while (especially with real LLMs), run in background
    background_tasks.add_task(EvaluationFramework.run_all)
    return {"status": "started", "message": "Evaluation suite started in background."}

@app.post("/api/simulate")
def simulate_existing(request: SimulationRequest):
    """Simulate runtime execution on arbitrary schemas."""
    try:
        from app.models.schemas import UISchema, APISchema, DBSchema, AuthSchema, BusinessRulesSchema
        from app.services.validation_engine import ValidationEngine
        
        ui = UISchema(**request.ui_schema)
        api = APISchema(**request.api_schema)
        db = DBSchema(**request.db_schema)
        auth = AuthSchema(**request.auth_schema)
        rules = BusinessRulesSchema(**request.business_rules)
        
        # Recalculate cross-layer integrity checks dynamically for the sandbox schemas
        report = ValidationEngine.validate_all(ui, api, db, auth, rules)
        
        simulation = RuntimeSimulator.simulate(ui, api, db, auth, rules, report)
        return {
            "validation_report": report,
            "execution_report": simulation
        }
    except Exception as e:
        logger.error(f"Simulation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Simulation failed: {str(e)}")
