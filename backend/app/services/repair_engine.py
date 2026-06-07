import json
import logging
from typing import Dict, Any, Tuple
from app.models.schemas import (
    IntentOutput, ArchitecturePlan, ValidationReport,
    UISchema, APISchema, DBSchema, AuthSchema, BusinessRulesSchema
)
from app.services.llm_client import call_llm
from app.services.schema_generator import SchemaGenerator

logger = logging.getLogger("forgeflow")

class RepairEngine:
    @staticmethod
    def analyze_root_cause(report: ValidationReport) -> str:
        """Determines which schema layer is the main source of validation errors."""
        # Collate issue counts per layer
        counts = {"UI": 0, "API": 0, "DB": 0, "AUTH": 0, "RULES": 0, "CROSS_LAYER": 0}
        for issue in report.issues:
            if issue.severity == "ERROR":
                counts[issue.layer] = counts.get(issue.layer, 0) + 1
                
                # Check path to target specific layer if flagged as CROSS_LAYER
                if issue.layer == "CROSS_LAYER":
                    path_lower = issue.path.lower()
                    if "api_schema" in path_lower:
                        counts["API"] += 1
                    elif "db_schema" in path_lower:
                        counts["DB"] += 1
                    elif "ui_schema" in path_lower:
                        counts["UI"] += 1
                    elif "auth_schema" in path_lower:
                        counts["AUTH"] += 1
                    elif "business_rules" in path_lower:
                        counts["RULES"] += 1

        # Return layer with most errors, default to API or DB
        logger.info(f"Repair analysis error counts: {counts}")
        if counts["DB"] > 0:
            return "DB"
        elif counts["API"] > 0:
            return "API"
        elif counts["UI"] > 0:
            return "UI"
        elif counts["AUTH"] > 0:
            return "AUTH"
        elif counts["RULES"] > 0:
            return "RULES"
        
        return "API"  # Default fallback

    @staticmethod
    def repair_layer(
        layer: str,
        issues: ValidationReport,
        intent: IntentOutput,
        plan: ArchitecturePlan,
        ui_schema: UISchema,
        api_schema: APISchema,
        db_schema: DBSchema,
        auth_schema: AuthSchema,
        business_rules: BusinessRulesSchema
    ) -> Tuple[UISchema, APISchema, DBSchema, AuthSchema, BusinessRulesSchema]:
        """Regenerates or repairs a specific layer using validation logs."""
        
        issue_logs = "\n".join([f"- [{issue.severity}] {issue.message}" for issue in issues.issues if issue.severity == "ERROR"])
        logger.info(f"Attempting to repair layer '{layer}' with validation errors:\n{issue_logs}")
        
        # If no key, perform rules-based fixes or reload schema
        if not intent.assumptions or not intent.features:
            # Safeguard structure
            return ui_schema, api_schema, db_schema, auth_schema, business_rules

        # Create LLM repair prompt
        prompt = (
            f"You are repairing a compilation failure in the {layer} Schema of '{intent.app_type}'.\n"
            f"Features: {intent.features}\n"
            f"Plan Entities: {plan.entities}\n"
            f"Validation Errors:\n{issue_logs}\n\n"
        )

        if layer == "DB":
            prompt += (
                f"Current Database Schema:\n{db_schema.model_dump_json(indent=2)}\n"
                f"API Schema reference:\n{api_schema.model_dump_json(indent=2)}\n"
                "Please output a corrected Database Schema adding any missing columns or correcting names to match the API endpoints."
            )
            schema = DBSchema.model_json_schema()
            system_prompt = "You are the Database Repair Agent. Fix columns and table structure to match requirements and endpoint signatures."
            
            result_dict = call_llm(prompt, schema, system_prompt)
            # Enforce deterministic order
            tables = result_dict.get("tables", [])
            for table in tables:
                cols = table.get("columns", [])
                table["columns"] = sorted(cols, key=lambda c: (not c.get("primary_key", False), c.get("name", "")))
            result_dict["tables"] = sorted(tables, key=lambda t: t.get("name", ""))
            
            db_schema = DBSchema(**result_dict)

        elif layer == "API":
            prompt += (
                f"Current API Schema:\n{api_schema.model_dump_json(indent=2)}\n"
                f"DB Schema reference:\n{db_schema.model_dump_json(indent=2)}\n"
                "Please output a corrected API Schema aligning required request parameter fields with DB columns."
            )
            schema = APISchema.model_json_schema()
            system_prompt = "You are the API Repair Agent. Fix routes, HTTP verbs, and parameter fields to match DB columns."
            
            result_dict = call_llm(prompt, schema, system_prompt)
            # Enforce deterministic order
            endpoints = result_dict.get("endpoints", [])
            for ep in endpoints:
                ep["required_fields"] = sorted(ep.get("required_fields", []))
                ep["response_fields"] = sorted(ep.get("response_fields", []))
            result_dict["endpoints"] = sorted(endpoints, key=lambda e: (e.get("path", ""), e.get("method", "")))
            
            api_schema = APISchema(**result_dict)

        elif layer == "UI":
            prompt += (
                f"Current UI Schema:\n{ui_schema.model_dump_json(indent=2)}\n"
                f"API Schema reference:\n{api_schema.model_dump_json(indent=2)}\n"
                "Please output a corrected UI Schema. Ensure form/table components point to endpoints that exist in the API schema."
            )
            schema = UISchema.model_json_schema()
            system_prompt = "You are the UI Repair Agent. Align components with valid backend endpoints."
            
            result_dict = call_llm(prompt, schema, system_prompt)
            # Enforce deterministic order
            pages = result_dict.get("pages", [])
            for page in pages:
                page["components"] = sorted(page.get("components", []), key=lambda c: c.get("name", ""))
            result_dict["pages"] = sorted(pages, key=lambda p: p.get("route", ""))
            
            ui_schema = UISchema(**result_dict)

        elif layer == "AUTH":
            prompt += (
                f"Current Auth Schema:\n{auth_schema.model_dump_json(indent=2)}\n"
                f"API Schema reference:\n{api_schema.model_dump_json(indent=2)}\n"
                "Please output a corrected Auth Schema, ensuring role permissions correspond to actual API endpoints."
            )
            schema = AuthSchema.model_json_schema()
            system_prompt = "You are the Auth Repair Agent. Align permissions with API methods."
            
            result_dict = call_llm(prompt, schema, system_prompt)
            # Enforce deterministic order
            roles = result_dict.get("roles", [])
            for role in roles:
                role["permissions"] = sorted(role.get("permissions", []))
            result_dict["roles"] = sorted(roles, key=lambda r: r.get("name", ""))
            
            auth_schema = AuthSchema(**result_dict)

        elif layer == "RULES":
            prompt += (
                f"Current Business Rules:\n{business_rules.model_dump_json(indent=2)}\n"
                f"DB Schema reference:\n{db_schema.model_dump_json(indent=2)}\n"
                "Please output corrected Business Rules mapping condition constraints and entities to correct DB table columns."
            )
            schema = BusinessRulesSchema.model_json_schema()
            system_prompt = "You are the Business Rules Repair Agent. Fix entity rules."
            
            result_dict = call_llm(prompt, schema, system_prompt)
            # Enforce deterministic order
            rules = result_dict.get("rules", [])
            result_dict["rules"] = sorted(rules, key=lambda r: r.get("name", ""))
            
            business_rules = BusinessRulesSchema(**result_dict)

        return ui_schema, api_schema, db_schema, auth_schema, business_rules
