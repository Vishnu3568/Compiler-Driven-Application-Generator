from app.models.schemas import IntentOutput
from app.services.llm_client import call_llm

class IntentExtractor:
    @staticmethod
    def extract(prompt: str) -> IntentOutput:
        system_prompt = (
            "You are the Intent Extraction Agent. Analyze the user prompt and extract: "
            "1. The type of application (app_type) "
            "2. Required high-level features (features) "
            "3. User roles involved (roles) "
            "4. Assumptions made for vague requests (assumptions) e.g., if the user asks for 'Uber for pets' "
            "make appropriate assumptions about how it works."
        )
        
        schema = IntentOutput.model_json_schema()
        result_dict = call_llm(
            prompt=f"Extract intent for user prompt: '{prompt}'",
            response_schema=schema,
            system_prompt=system_prompt
        )
        
        # Enforce sorted lists for deterministic stable ordering (Stage 8 requirement)
        result_dict["features"] = sorted(result_dict.get("features", []))
        result_dict["roles"] = sorted(result_dict.get("roles", []))
        result_dict["assumptions"] = sorted(result_dict.get("assumptions", []))
        
        return IntentOutput(**result_dict)
