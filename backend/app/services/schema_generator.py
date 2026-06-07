from app.models.schemas import (
    IntentOutput, ArchitecturePlan,
    UISchema, UISchemaPage, UIComponent,
    APISchema, APIEndpoint,
    DBSchema, DBSchemaTable, DBSchemaColumn,
    AuthSchema, AuthRole,
    BusinessRulesSchema, BusinessRule
)
from app.services.llm_client import call_llm

class SchemaGenerator:
    @staticmethod
    def generate_ui_schema(intent: IntentOutput, plan: ArchitecturePlan) -> UISchema:
        prompt = (
            f"Generate a UI Schema for a '{intent.app_type}' app. "
            f"Pages planned: {plan.pages}. Features: {intent.features}."
        )
        system_prompt = (
            "You are the UI Schema Generator. Map each planned page to routes and UI components like forms, stats, tables. "
            "Ensure the components are logically named (e.g. ContactForm, RevenueChart, StatsCard)."
        )
        
        schema = UISchema.model_json_schema()
        result_dict = call_llm(prompt, schema, system_prompt)
        
        # Deterministic sorting (Stage 8)
        pages = result_dict.get("pages", [])
        for page in pages:
            page["components"] = sorted(page.get("components", []), key=lambda c: c.get("name", ""))
        result_dict["pages"] = sorted(pages, key=lambda p: p.get("route", ""))
        
        return UISchema(**result_dict)

    @staticmethod
    def generate_api_schema(intent: IntentOutput, plan: ArchitecturePlan) -> APISchema:
        prompt = (
            f"Generate an API Schema for a '{intent.app_type}' app. "
            f"Entities planned: {plan.entities}. Services: {plan.services}."
        )
        system_prompt = (
            "You are the API Schema Generator. Output endpoints with HTTP methods, path, required_fields, and response_fields. "
            "Map endpoints logically to DB entities (e.g. POST /contacts, GET /contacts, GET /deals)."
        )
        
        schema = APISchema.model_json_schema()
        result_dict = call_llm(prompt, schema, system_prompt)
        
        # Deterministic sorting (Stage 8)
        endpoints = result_dict.get("endpoints", [])
        for ep in endpoints:
            ep["required_fields"] = sorted(ep.get("required_fields", []))
            ep["response_fields"] = sorted(ep.get("response_fields", []))
        result_dict["endpoints"] = sorted(endpoints, key=lambda e: (e.get("path", ""), e.get("method", "")))
        
        return APISchema(**result_dict)

    @staticmethod
    def generate_db_schema(intent: IntentOutput, plan: ArchitecturePlan) -> DBSchema:
        prompt = (
            f"Generate a Database Schema for a '{intent.app_type}' app. "
            f"Entities planned: {plan.entities}."
        )
        system_prompt = (
            "You are the Database Schema Generator. Define tables with column lists. Columns must have name, type (varchar, uuid, integer, etc.), primary_key, and nullable. "
            "Always include primary keys and foreign keys where applicable."
        )
        
        schema = DBSchema.model_json_schema()
        result_dict = call_llm(prompt, schema, system_prompt)
        
        # Deterministic sorting (Stage 8)
        tables = result_dict.get("tables", [])
        for table in tables:
            # Sort columns: primary key first, then alphabetically
            cols = table.get("columns", [])
            table["columns"] = sorted(cols, key=lambda c: (not c.get("primary_key", False), c.get("name", "")))
        result_dict["tables"] = sorted(tables, key=lambda t: t.get("name", ""))
        
        return DBSchema(**result_dict)

    @staticmethod
    def generate_auth_schema(intent: IntentOutput, plan: ArchitecturePlan) -> AuthSchema:
        prompt = (
            f"Generate an Auth Schema for a '{intent.app_type}' app. "
            f"User roles: {intent.roles}."
        )
        system_prompt = (
            "You are the Authentication Schema Generator. For each role, output their granular permissions. "
            "For example: admin role gets permissions: ['create_contact', 'view_analytics'], while user gets ['view_contacts']."
        )
        
        schema = AuthSchema.model_json_schema()
        result_dict = call_llm(prompt, schema, system_prompt)
        
        # Deterministic sorting (Stage 8)
        roles = result_dict.get("roles", [])
        for role in roles:
            role["permissions"] = sorted(role.get("permissions", []))
        result_dict["roles"] = sorted(roles, key=lambda r: r.get("name", ""))
        
        return AuthSchema(**result_dict)

    @staticmethod
    def generate_business_rules(intent: IntentOutput, plan: ArchitecturePlan) -> BusinessRulesSchema:
        prompt = (
            f"Generate Business Rules constraints for a '{intent.app_type}' app. "
            f"Entities: {plan.entities}."
        )
        system_prompt = (
            "You are the Business Rules Generator. Output constraints with condition expressions, "
            "describing rules like 'limit premium plans to 10 active tasks' or 'disallow booking if weight is exceeded'."
        )
        
        schema = BusinessRulesSchema.model_json_schema()
        result_dict = call_llm(prompt, schema, system_prompt)
        
        # Deterministic sorting (Stage 8)
        rules = result_dict.get("rules", [])
        result_dict["rules"] = sorted(rules, key=lambda r: r.get("name", ""))
        
        return BusinessRulesSchema(**result_dict)
