import re
import dns.resolver
from dataclasses import dataclass, asdict
from typing import Optional

@dataclass
class ValidationResult:
    email: str
    status: str
    reason: Optional[str] = None

    def to_dict(self):
        return asdict(self)

EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
)

def validate_email_format(email: str) -> bool:
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email))

def check_mx_records(domain: str) -> bool:
    try:
        dns.resolver.resolve(domain, 'MX')
        return True
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers, dns.exception.Timeout):
        return False
    except Exception:
        return False

def validate_email(email: str) -> ValidationResult:
    if not validate_email_format(email):
        return ValidationResult(email=email, status="invalid", reason="invalid_format")
    
    domain = email.split('@')[1]
    if not check_mx_records(domain):
        return ValidationResult(email=email, status="invalid", reason="no_mx_records")
    
    return ValidationResult(email=email, status="valid", reason=None)

def validate_emails_batch(emails: list[str]) -> list[ValidationResult]:
    return [validate_email(email) for email in emails]
