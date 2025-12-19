import re
import json
from dataclasses import dataclass
from typing import Optional

PLACEHOLDER_REGEX = re.compile(r'\{\{(\w+)\}\}')

@dataclass
class TemplateError:
    message: str
    missing_variables: list[str]

def parse_placeholders(template: str) -> list[str]:
    matches = PLACEHOLDER_REGEX.findall(template)
    return list(dict.fromkeys(matches))

def render_template(template: str, variables: dict) -> tuple[Optional[str], Optional[TemplateError]]:
    placeholders = parse_placeholders(template)
    missing = [p for p in placeholders if p not in variables]
    
    if missing:
        return None, TemplateError(
            message=f"Missing template variable: {missing[0]}",
            missing_variables=missing
        )
    
    def replace_placeholder(match):
        var_name = match.group(1)
        return str(variables.get(var_name, match.group(0)))
    
    result = PLACEHOLDER_REGEX.sub(replace_placeholder, template)
    return result, None

def validate_variables(template: str, available_vars: list[str]) -> list[str]:
    placeholders = parse_placeholders(template)
    return [p for p in placeholders if p not in available_vars]

def template_to_json(template: str) -> str:
    return json.dumps({"template": template})

def template_from_json(json_str: str) -> str:
    data = json.loads(json_str)
    return data["template"]
