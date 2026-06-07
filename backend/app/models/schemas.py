from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# --- Phase 1: Intent Extraction & Assumptions ---

class IntentOutput(BaseModel):
    app_type: str = Field(..., description="The type of application, e.g. CRM, ERP, E-commerce")
    features: List[str] = Field(..., description="Key features needed for the application")
    roles: List[str] = Field(..., description="User roles identified in the system")
    assumptions: List[str] = Field(default_factory=list, description="Extracted assumptions for vague aspects of the prompt")

# --- Phase 2: Architecture Planning ---

class ArchitecturePlan(BaseModel):
    entities: List[str] = Field(..., description="List of system entities/data models")
    pages: List[str] = Field(..., description="List of page views/dashboards needed")
    services: List[str] = Field(..., description="Backend services/logic modules")

# --- Phase 3: Schema Generation ---

class UIComponent(BaseModel):
    name: str = Field(..., description="Name of the component, e.g., ContactForm, StatsCard")
    type: str = Field(..., description="Type of component, e.g., form, table, card, chart")
    props: Dict[str, Any] = Field(default_factory=dict, description="Component configuration properties")

class UISchemaPage(BaseModel):
    name: str = Field(..., description="Page name, e.g., Dashboard")
    route: str = Field(..., description="Router path, e.g., /dashboard")
    components: List[UIComponent] = Field(..., description="Components rendering on this page")

class UISchema(BaseModel):
    pages: List[UISchemaPage] = Field(..., description="Pages defined in the UI layer")

class APIEndpoint(BaseModel):
    path: str = Field(..., description="Endpoint URL path, e.g., /contacts")
    method: str = Field(..., description="HTTP verb, e.g., GET, POST")
    required_fields: List[str] = Field(default_factory=list, description="Fields required in the request body")
    response_fields: List[str] = Field(default_factory=list, description="Fields returned in the response body")
    description: str = Field(..., description="Description of endpoint purpose")

class APISchema(BaseModel):
    endpoints: List[APIEndpoint] = Field(..., description="Endpoints in the API layer")

class DBSchemaColumn(BaseModel):
    name: str = Field(..., description="Column name")
    type: str = Field(..., description="SQL Data type, e.g., uuid, varchar, integer, boolean")
    primary_key: bool = Field(default=False, description="Is primary key")
    nullable: bool = Field(default=True, description="Is nullable")

class DBSchemaTable(BaseModel):
    name: str = Field(..., description="Table name")
    columns: List[DBSchemaColumn] = Field(..., description="Columns of the table")

class DBSchema(BaseModel):
    tables: List[DBSchemaTable] = Field(..., description="Tables in the DB layer")

class AuthRole(BaseModel):
    name: str = Field(..., description="Role name, e.g., admin, user")
    permissions: List[str] = Field(..., description="List of allowed actions, e.g., view_analytics, create_contact")

class AuthSchema(BaseModel):
    roles: List[AuthRole] = Field(..., description="Roles and permissions defined in the Auth layer")

class BusinessRule(BaseModel):
    name: str = Field(..., description="Unique name of the business rule")
    description: str = Field(..., description="Natural language description of rule logic")
    entity: str = Field(..., description="Target entity, e.g., Contact")
    condition: str = Field(..., description="Logic condition expression, e.g., count <= 10")

class BusinessRulesSchema(BaseModel):
    rules: List[BusinessRule] = Field(..., description="List of business rule constraints")

# --- Phase 4: Validation Engine ---

class ValidationIssue(BaseModel):
    layer: str = Field(..., description="Target layer: UI, API, DB, AUTH, RULES, or CROSS_LAYER")
    severity: str = Field(..., description="Severity level: ERROR or WARNING")
    message: str = Field(..., description="Error message detailing the failure")
    path: str = Field(..., description="Location of error, e.g., db_schema.tables[0].columns[1]")

class ValidationReport(BaseModel):
    is_valid: bool = Field(..., description="True if no validation errors exist")
    issues: List[ValidationIssue] = Field(default_factory=list, description="List of issues identified")

# --- Phase 6: Runtime Simulation ---

class ExecutionStep(BaseModel):
    step_name: str = Field(..., description="Name of simulation step, e.g., Run Migrations")
    success: bool = Field(..., description="Success outcome")
    details: str = Field(..., description="Detailed description of results")

class ExecutionReport(BaseModel):
    success: bool = Field(..., description="Overall simulation outcome")
    steps: List[ExecutionStep] = Field(default_factory=list, description="Chronological simulation steps")
    logs: List[str] = Field(default_factory=list, description="Console output/trace from simulation execution")
    errors: List[str] = Field(default_factory=list, description="Errors collected during runtime simulation")

# --- Final Output ---

class Blueprint(BaseModel):
    id: str = Field(..., description="Unique generation run ID")
    prompt: str = Field(..., description="User's original prompt")
    intent: IntentOutput
    architecture_plan: ArchitecturePlan
    ui_schema: UISchema
    api_schema: APISchema
    db_schema: DBSchema
    auth_schema: AuthSchema
    business_rules: BusinessRulesSchema
    validation_report: ValidationReport
    execution_report: Optional[ExecutionReport] = None
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Metadata metrics like latency, repair counts, success flags")
