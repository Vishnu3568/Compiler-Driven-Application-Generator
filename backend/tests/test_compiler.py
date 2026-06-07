import pytest
from app.models.schemas import (
    IntentOutput, ArchitecturePlan,
    UISchema, UISchemaPage, UIComponent,
    APISchema, APIEndpoint,
    DBSchema, DBSchemaTable, DBSchemaColumn,
    AuthSchema, AuthRole,
    BusinessRulesSchema, BusinessRule
)
from app.services.validation_engine import ValidationEngine
from app.services.repair_engine import RepairEngine
from app.services.runtime_simulator import RuntimeSimulator
from app.services.orchestrator import Orchestrator

def test_validation_clean():
    # Construct completely consistent schemas
    ui = UISchema(pages=[
        UISchemaPage(name="Contacts", route="/contacts", components=[
            UIComponent(name="ContactTable", type="table", props={}),
            UIComponent(name="ContactForm", type="form", props={})
        ])
    ])
    api = APISchema(endpoints=[
        APIEndpoint(path="/contacts", method="GET", response_fields=["id", "name"], description="Get contacts"),
        APIEndpoint(path="/contacts", method="POST", required_fields=["name"], response_fields=["id"], description="Create contact")
    ])
    db = DBSchema(tables=[
        DBSchemaTable(name="contacts", columns=[
            DBSchemaColumn(name="id", type="uuid", primary_key=True, nullable=False),
            DBSchemaColumn(name="name", type="varchar", primary_key=False, nullable=False)
        ])
    ])
    auth = AuthSchema(roles=[
        AuthRole(name="admin", permissions=["create_contact", "view_contacts"])
    ])
    rules = BusinessRulesSchema(rules=[
        BusinessRule(name="check_name", description="Name is required", entity="Contact", condition="len(name) > 0")
    ])

    report = ValidationEngine.validate_all(ui, api, db, auth, rules)
    assert report.is_valid is True
    assert len(report.issues) == 0

def test_validation_mismatch():
    # DB Table missing a column required by API
    ui = UISchema(pages=[])
    api = APISchema(endpoints=[
        APIEndpoint(path="/contacts", method="POST", required_fields=["email"], description="Create contact")
    ])
    db = DBSchema(tables=[
        DBSchemaTable(name="contacts", columns=[
            DBSchemaColumn(name="id", type="uuid", primary_key=True)
            # missing email column
        ])
    ])
    auth = AuthSchema(roles=[])
    rules = BusinessRulesSchema(rules=[])

    report = ValidationEngine.validate_all(ui, api, db, auth, rules)
    # The validation should fail because of API required field not in DB
    assert report.is_valid is False
    errors = [issue for issue in report.issues if issue.severity == "ERROR"]
    assert len(errors) > 0
    assert any("does not exist in matching database table" in issue.message for issue in errors)

def test_repair_identification():
    # Intentionally trigger an API validation failure
    ui = UISchema(pages=[])
    api = APISchema(endpoints=[
        APIEndpoint(path="/contacts", method="POST", required_fields=["email"], description="Create contact")
    ])
    db = DBSchema(tables=[
        DBSchemaTable(name="contacts", columns=[
            DBSchemaColumn(name="id", type="uuid", primary_key=True)
        ])
    ])
    auth = AuthSchema(roles=[])
    rules = BusinessRulesSchema(rules=[])

    report = ValidationEngine.validate_all(ui, api, db, auth, rules)
    assert report.is_valid is False
    
    # Analyze root cause
    failing_layer = RepairEngine.analyze_root_cause(report)
    # The error was: email field is missing from DB, which is checked as DB consistency
    # Our analyzer correctly prioritizes DB if DB is flagged or API is flagged
    assert failing_layer in ["DB", "API"]

def test_sqlite_simulator_success():
    # Simple simulator dry-run test
    ui = UISchema(pages=[])
    api = APISchema(endpoints=[])
    db = DBSchema(tables=[
        DBSchemaTable(name="contacts", columns=[
            DBSchemaColumn(name="id", type="uuid", primary_key=True, nullable=False),
            DBSchemaColumn(name="name", type="varchar", primary_key=False, nullable=True)
        ])
    ])
    auth = AuthSchema(roles=[])
    rules = BusinessRulesSchema(rules=[])
    report = ValidationEngine.validate_all(ui, api, db, auth, rules)

    import tempfile
    import os
    test_dir = os.path.join(tempfile.gettempdir(), "forgeflow-test")
    exec_report = RuntimeSimulator.simulate(
        ui, api, db, auth, rules, report,
        base_dir=test_dir
    )
    assert exec_report.success is True
    assert len(exec_report.errors) == 0

def test_full_orchestrator_compilation():
    blueprint = Orchestrator.compile_app("Build a CRM with contacts and billing dashboard.")
    assert blueprint.id is not None
    assert blueprint.intent.app_type is not None
    assert blueprint.validation_report.is_valid is True
    assert blueprint.execution_report.success is True

def test_new_validation_rules():
    ui = UISchema(pages=[])
    api = APISchema(endpoints=[
        # 1. Aggregate endpoint (GET /analytics/summary)
        APIEndpoint(path="/analytics/summary", method="GET", response_fields=["revenue"], description="Summary stats"),
        # 2. Synonym endpoint (POST /profile) matching db table 'users'
        APIEndpoint(path="/profile", method="POST", required_fields=["username"], response_fields=["id"], description="Update profile")
    ])
    db = DBSchema(tables=[
        DBSchemaTable(name="users", columns=[
            DBSchemaColumn(name="id", type="uuid", primary_key=True, nullable=False),
            DBSchemaColumn(name="username", type="varchar", primary_key=False, nullable=False)
        ])
    ])
    auth = AuthSchema(roles=[
        # 3. Permission view_analytics matching GET /analytics/summary
        AuthRole(name="admin", permissions=["view_analytics"])
    ])
    rules = BusinessRulesSchema(rules=[])

    report = ValidationEngine.validate_all(ui, api, db, auth, rules)
    assert report.is_valid is True
    assert len(report.issues) == 0

def test_export_blueprint_zip():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    
    # 1. Trigger compilation first
    response = client.post("/api/generate", json={"prompt": "Build CRM"})
    assert response.status_code == 200
    blueprint_id = response.json()["id"]
    
    # 2. Test export endpoint
    export_response = client.get(f"/api/export/{blueprint_id}")
    assert export_response.status_code == 200
    assert export_response.headers["content-type"] == "application/zip"


