from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class ValidationResult:
    email: str
    status: str
    reason: Optional[str] = None

@dataclass
class SMTPConfig:
    host: str
    port: int
    username: str
    password: str
    from_email: str
    use_tls: bool = True

@dataclass
class Recipient:
    email: str
    name: str
    variables: dict

@dataclass
class DeliveryRecord:
    email: str
    recipient_name: str
    validation_status: str
    send_status: str
    failure_reason: Optional[str]
    timestamp: datetime

@dataclass
class CampaignStatus:
    campaign_id: str
    total: int
    sent: int
    failed: int
    pending: int
    status: str
