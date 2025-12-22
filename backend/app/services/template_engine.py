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
    """
    Render a template by replacing placeholders with variable values.
    Missing variables are replaced with empty string (lenient mode).
    Variables with value 'none' (case insensitive) are also replaced with empty string.
    After substitution, removes any anchor tags with empty href attributes.
    """
    def replace_placeholder(match):
        var_name = match.group(1)
        value = variables.get(var_name, '')
        value = str(value).strip()
        if value.lower() == 'none':
            return ''
        return value
    
    result = PLACEHOLDER_REGEX.sub(replace_placeholder, template)
    
    result = re.sub(r'<a\s+[^>]*href=["\']["\'][^>]*>([^<]*)</a>', r'\1', result, flags=re.IGNORECASE)
    result = re.sub(r'<a\s+[^>]*href=["\']["\'][^>]*>(.*?)</a>', r'\1', result, flags=re.IGNORECASE | re.DOTALL)
    
    return result, None

def validate_variables(template: str, available_vars: list[str]) -> list[str]:
    placeholders = parse_placeholders(template)
    return [p for p in placeholders if p not in available_vars]

def template_to_json(template: str) -> str:
    return json.dumps({"template": template})

def template_from_json(json_str: str) -> str:
    data = json.loads(json_str)
    return data["template"]
