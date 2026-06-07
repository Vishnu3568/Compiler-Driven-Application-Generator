from app.models.schemas import IntentOutput, ArchitecturePlan
from app.services.llm_client import call_llm

class ArchitecturePlanner:
    @staticmethod
    def plan(intent: IntentOutput) -> ArchitecturePlan:
        prompt = (
            f"Generate an architecture plan for a '{intent.app_type}' application with the following features: {intent.features} "
            f"and user roles: {intent.roles}. Assumptions: {intent.assumptions}."
        )
        
        system_prompt = (
            "You are the Architecture Planner Agent. Map the requirements into standard system components: "
            "1. entities: database tables / schemas "
            "2. pages: front-end UI page routes "
            "3. services: business logic layer services"
        )
        
        schema = ArchitecturePlan.model_json_schema()
        result_dict = call_llm(
            prompt=prompt,
            response_schema=schema,
            system_prompt=system_prompt
        )
        
        # Enforce deterministic sorting (Stage 8 requirement)
        result_dict["entities"] = sorted(result_dict.get("entities", []))
        result_dict["pages"] = sorted(result_dict.get("pages", []))
        result_dict["services"] = sorted(result_dict.get("services", []))
        
        return ArchitecturePlan(**result_dict)
