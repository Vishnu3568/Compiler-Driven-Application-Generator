import os
import tempfile
import time
import uuid
import logging
from typing import Optional, Dict, Any
from app.models.schemas import Blueprint, IntentOutput, ArchitecturePlan
from app.services.intent_extractor import IntentExtractor
from app.services.architecture_planner import ArchitecturePlanner
from app.services.schema_generator import SchemaGenerator
from app.services.validation_engine import ValidationEngine
from app.services.repair_engine import RepairEngine
from app.services.runtime_simulator import RuntimeSimulator

logger = logging.getLogger("forgeflow")

class Orchestrator:
    @staticmethod
    def compile_app(
        prompt: str,
        custom_settings: Optional[Dict[str, Any]] = None,
        base_dir: Optional[str] = None
    ) -> Blueprint:
        if base_dir is None:
            try:
                base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "generated-app")
                os.makedirs(base_dir, exist_ok=True)
            except Exception:
                base_dir = os.path.join(tempfile.gettempdir(), "forgeflow", "generated-app")
                os.makedirs(base_dir, exist_ok=True)
        start_time = time.time()
        repairs_attempted = 0
        max_repairs = 3
        
        # Unique build ID
        build_id = str(uuid.uuid4())
        
        # --- Stage 1: Intent Extraction & Assumption Engine (Stage 1 & 7) ---
        logger.info(f"[{build_id}] Stage 1: Extracting Intent & Assumptions...")
        intent = IntentExtractor.extract(prompt)
        
        # --- Stage 2: Architecture Planning ---
        logger.info(f"[{build_id}] Stage 2: Creating Architecture Plan...")
        plan = ArchitecturePlanner.plan(intent)
        
        # --- Stage 3: Initial Schema Generation (UI, API, DB, Auth, Rules) ---
        logger.info(f"[{build_id}] Stage 3: Generating schemas...")
        ui_schema = SchemaGenerator.generate_ui_schema(intent, plan)
        api_schema = SchemaGenerator.generate_api_schema(intent, plan)
        db_schema = SchemaGenerator.generate_db_schema(intent, plan)
        auth_schema = SchemaGenerator.generate_auth_schema(intent, plan)
        business_rules = SchemaGenerator.generate_business_rules(intent, plan)
        
        # --- Stage 4 & 5: Validation & Intelligent Repair Loop ---
        logger.info(f"[{build_id}] Stage 4: Starting Validation...")
        validation_report = ValidationEngine.validate_all(
            ui_schema, api_schema, db_schema, auth_schema, business_rules
        )
        
        while not validation_report.is_valid and repairs_attempted < max_repairs:
            repairs_attempted += 1
            logger.info(f"[{build_id}] Stage 5: Validation failed. Repair Attempt #{repairs_attempted}...")
            
            # Determine which layer needs repair
            target_layer = RepairEngine.analyze_root_cause(validation_report)
            
            # Perform targeted repair on that component
            ui_schema, api_schema, db_schema, auth_schema, business_rules = RepairEngine.repair_layer(
                layer=target_layer,
                issues=validation_report,
                intent=intent,
                plan=plan,
                ui_schema=ui_schema,
                api_schema=api_schema,
                db_schema=db_schema,
                auth_schema=auth_schema,
                business_rules=business_rules
            )
            
            # Revalidate
            validation_report = ValidationEngine.validate_all(
                ui_schema, api_schema, db_schema, auth_schema, business_rules
            )
        
        # --- Stage 6: Runtime Simulation ---
        logger.info(f"[{build_id}] Stage 6: Initiating Runtime Simulation...")
        execution_report = RuntimeSimulator.simulate(
            ui_schema, api_schema, db_schema, auth_schema, business_rules, validation_report, base_dir
        )
        
        end_time = time.time()
        latency = round(end_time - start_time, 2)
        
        # Compile Metrics
        metrics = {
            "latency_sec": latency,
            "repairs_count": repairs_attempted,
            "json_validity": 100 if validation_report.is_valid else 0,
            "schema_consistency": 100 if validation_report.is_valid else max(0, 100 - (len(validation_report.issues) * 10)),
            "success": execution_report.success and validation_report.is_valid
        }
        
        logger.info(f"[{build_id}] Compilation complete! Latency: {latency}s, Success: {metrics['success']}")
        
        return Blueprint(
            id=build_id,
            prompt=prompt,
            intent=intent,
            architecture_plan=plan,
            ui_schema=ui_schema,
            api_schema=api_schema,
            db_schema=db_schema,
            auth_schema=auth_schema,
            business_rules=business_rules,
            validation_report=validation_report,
            execution_report=execution_report,
            metrics=metrics
        )
