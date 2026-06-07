from app.models.schemas import (
    UISchema, APISchema, DBSchema, AuthSchema, BusinessRulesSchema,
    ValidationReport, ValidationIssue
)

class ValidationEngine:
    @staticmethod
    def validate_all(
        ui_schema: UISchema,
        api_schema: APISchema,
        db_schema: DBSchema,
        auth_schema: AuthSchema,
        business_rules: BusinessRulesSchema
    ) -> ValidationReport:
        issues = []
        
        # 1. Helper mapping of DB table names and columns
        db_tables = {table.name.lower(): [col.name.lower() for col in table.columns] for table in db_schema.tables}
        
        # 2. Check API vs Database Consistency
        aggregate_keywords = {"analytics", "summary", "report", "dashboard", "metrics", "stats"}
        synonym_map = {
            "profile": "users",
            "me": "users",
            "auth": "users",
            "login": "users",
            "signup": "users"
        }
        for ep in api_schema.endpoints:
            path_lower = ep.path.lower()
            path_parts = path_lower.strip("/").split("/")
            
            # Skip database table matching warnings for aggregate endpoints that combine tables
            if any(kw in path_parts or kw in path_lower for kw in aggregate_keywords):
                continue
                
            # Simple heuristic to find target table from path, e.g., /contacts -> contacts, /api/deals -> deals
            clean_path = path_parts[-1] if path_parts else ""
            
            # Apply synonym mapping (e.g. /profile -> users)
            resolved_path = clean_path
            for syn, target in synonym_map.items():
                if syn in clean_path:
                    resolved_path = target
                    break
            
            # Find closest matching table
            matched_table = None
            for table_name in db_tables:
                if table_name in resolved_path or resolved_path in table_name:
                    matched_table = table_name
                    break
            
            if not matched_table:
                issues.append(ValidationIssue(
                    layer="CROSS_LAYER",
                    severity="WARNING",
                    message=f"API Endpoint '{ep.method} {ep.path}' has no clear matching database table.",
                    path=f"api_schema.endpoints[{api_schema.endpoints.index(ep)}]"
                ))
            else:
                table_cols = db_tables[matched_table]
                # Check required fields exist in DB table columns
                for req_field in ep.required_fields:
                    if req_field.lower() not in table_cols and req_field.lower() not in ["id", "created_at", "updated_at"]:
                        issues.append(ValidationIssue(
                            layer="CROSS_LAYER",
                            severity="ERROR",
                            message=f"API parameter '{req_field}' in endpoint '{ep.method} {ep.path}' does not exist in matching database table '{matched_table}' columns: {table_cols}.",
                            path=f"api_schema.endpoints[{api_schema.endpoints.index(ep)}].required_fields"
                        ))

        # 3. Check UI vs API Consistency
        # UI components that fetch or submit data must have corresponding API endpoints
        api_endpoints = {(ep.path.lower(), ep.method.upper()) for ep in api_schema.endpoints}
        for page_idx, page in enumerate(ui_schema.pages):
            for comp_idx, comp in enumerate(page.components):
                # Form components require POST/PUT endpoint
                if comp.type == "form":
                    # Infer expected path
                    target_entity = comp.name.lower().replace("form", "")
                    # Check if there is any POST endpoint matching target entity
                    has_post = any(target_entity in path and method == "POST" for path, method in api_endpoints)
                    if not has_post:
                        issues.append(ValidationIssue(
                            layer="CROSS_LAYER",
                            severity="ERROR",
                            message=f"UI Form component '{comp.name}' on page '{page.name}' expects a POST api endpoint for '{target_entity}', but none was found.",
                            path=f"ui_schema.pages[{page_idx}].components[{comp_idx}]"
                        ))
                # Table or list components require GET endpoint
                elif comp.type in ["table", "list", "chart"]:
                    target_entity = comp.name.lower().replace("table", "").replace("list", "").replace("chart", "")
                    has_get = any((target_entity in path or "analytics" in path) and method == "GET" for path, method in api_endpoints)
                    if not has_get:
                        issues.append(ValidationIssue(
                            layer="CROSS_LAYER",
                            severity="WARNING",
                            message=f"UI Data component '{comp.name}' on page '{page.name}' expects a GET api endpoint, but no suitable endpoint was found.",
                            path=f"ui_schema.pages[{page_idx}].components[{comp_idx}]"
                        ))

        # 4. Check Roles vs Permissions Consistency
        # Permissions should map to endpoint actions (e.g. create_contact -> POST /contacts, view_contacts -> GET /contacts)
        for role_idx, role in enumerate(auth_schema.roles):
            for perm_idx, perm in enumerate(role.permissions):
                perm_lower = perm.lower()
                # Determine action type
                action_type = None
                if any(x in perm_lower for x in ["create", "add", "post"]):
                    action_type = "POST"
                elif any(x in perm_lower for x in ["view", "get", "read", "list"]):
                    action_type = "GET"
                elif any(x in perm_lower for x in ["delete", "remove"]):
                    action_type = "DELETE"
                elif any(x in perm_lower for x in ["update", "edit", "put", "patch"]):
                    action_type = "PUT"
                
                # Verify permission exists in API schemas
                if action_type:
                    matched = False
                    
                    # Strip verb prefixes to get the core action domain/entity
                    stripped_perm = perm_lower
                    prefixes = [
                        "create_", "add_", "post_", "view_", "get_", "read_", "list_",
                        "delete_", "remove_", "update_", "edit_", "put_", "patch_", "manage_"
                    ]
                    for prefix in prefixes:
                        if stripped_perm.startswith(prefix):
                            stripped_perm = stripped_perm[len(prefix):]
                            break
                            
                    for ep in api_schema.endpoints:
                        if ep.method.upper() != action_type:
                            continue
                        
                        clean_path = ep.path.strip("/").lower()
                        stemmed_path = clean_path.rstrip("s")
                        stemmed_perm = stripped_perm.rstrip("s")
                        
                        path_parts = clean_path.split("/")
                        perm_parts = stripped_perm.split("_")
                        
                        overlap = any(
                            p in path_parts or p.rstrip("s") in path_parts or 
                            any(path_part.rstrip("s") == p.rstrip("s") for path_part in path_parts) 
                            for p in perm_parts
                        )
                        
                        if (
                            stemmed_path in stemmed_perm or stemmed_perm in stemmed_path
                            or stemmed_path.replace("_", "") in stemmed_perm.replace("_", "")
                            or stemmed_perm.replace("_", "") in stemmed_path.replace("_", "")
                            or overlap
                        ):
                            matched = True
                            break
                    if not matched:
                        # Warning to allow flexible permissions, but flag potential mismatches
                        issues.append(ValidationIssue(
                            layer="CROSS_LAYER",
                            severity="WARNING",
                            message=f"Permission '{perm}' assigned to role '{role.name}' has no matching endpoint operation.",
                            path=f"auth_schema.roles[{role_idx}].permissions[{perm_idx}]"
                        ))

        # 5. Check Business Rules vs DB Schema Consistency
        # Business rule entities must map to a database table
        for rule_idx, rule in enumerate(business_rules.rules):
            rule_entity_lower = rule.entity.lower()
            matched_table = None
            for table_name in db_tables:
                if table_name in rule_entity_lower or rule_entity_lower in table_name:
                    matched_table = table_name
                    break
            
            if not matched_table:
                issues.append(ValidationIssue(
                    layer="CROSS_LAYER",
                    severity="ERROR",
                    message=f"Business Rule '{rule.name}' targets entity '{rule.entity}', but database table was not found.",
                    path=f"business_rules.rules[{rule_idx}].entity"
                ))

        # Separate out errors to evaluate validation state
        errors = [issue for issue in issues if issue.severity == "ERROR"]
        is_valid = len(errors) == 0

        return ValidationReport(is_valid=is_valid, issues=issues)
