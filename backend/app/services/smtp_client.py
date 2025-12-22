import smtplib
import time
import uuid
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from dataclasses import dataclass, asdict
from typing import Optional
from datetime import datetime
from html import unescape
import re

@dataclass
class SMTPConfig:
    host: str
    port: int
    username: str
    password: str
    from_email: str
    use_tls: bool = True
    from_name: Optional[str] = None

    def to_dict(self):
        return asdict(self)
    
    def get_from_header(self) -> str:
        if self.from_name:
            return formataddr((self.from_name, self.from_email))
        return self.from_email

@dataclass
class SendResult:
    success: bool
    error: Optional[str] = None

@dataclass
class DeliveryRecord:
    email: str
    recipient_name: str
    validation_status: str
    send_status: str
    failure_reason: Optional[str]
    timestamp: str

    def to_dict(self):
        return asdict(self)

@dataclass
class CampaignStatus:
    campaign_id: str
    total: int
    sent: int
    failed: int
    pending: int
    status: str
    current_batch: int = 0
    total_batches: int = 0
    next_batch_in: float = 0

    def to_dict(self):
        return asdict(self)

smtp_config: Optional[SMTPConfig] = None
campaigns: dict = {}
delivery_records: dict = {}

def configure_smtp(config: SMTPConfig) -> tuple[bool, Optional[str]]:
    global smtp_config
    try:
        if config.use_tls:
            server = smtplib.SMTP(config.host, config.port, timeout=10)
            server.starttls()
        else:
            server = smtplib.SMTP(config.host, config.port, timeout=10)
        server.login(config.username, config.password)
        server.quit()
        smtp_config = config
        return True, None
    except smtplib.SMTPAuthenticationError:
        return False, "SMTP authentication failed"
    except Exception as e:
        return False, f"SMTP connection failed: {str(e)}"

def get_smtp_config() -> Optional[SMTPConfig]:
    return smtp_config

def html_to_plain(html: str) -> str:
    text = re.sub(r'<br\s*/?>', '\n', html)
    text = re.sub(r'</p>', '\n\n', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = unescape(text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def send_email(to_email: str, subject: str, html_body: str, recipient_name: str = "") -> SendResult:
    global smtp_config
    if not smtp_config:
        return SendResult(success=False, error="SMTP not configured")
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = smtp_config.get_from_header()
        msg['To'] = formataddr((recipient_name, to_email)) if recipient_name else to_email
        msg['Reply-To'] = smtp_config.from_email
        msg['X-Mailer'] = 'MassMailer/1.0'
        msg['List-Unsubscribe'] = f'<mailto:{smtp_config.from_email}?subject=unsubscribe>'
        
        plain_text = html_to_plain(html_body)
        text_part = MIMEText(plain_text, 'plain', 'utf-8')
        html_part = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(text_part)
        msg.attach(html_part)
        
        if smtp_config.use_tls:
            server = smtplib.SMTP(smtp_config.host, smtp_config.port, timeout=30)
            server.starttls()
        else:
            server = smtplib.SMTP(smtp_config.host, smtp_config.port, timeout=30)
        
        server.login(smtp_config.username, smtp_config.password)
        server.sendmail(smtp_config.from_email, to_email, msg.as_string())
        server.quit()
        return SendResult(success=True)
    except smtplib.SMTPRecipientsRefused:
        return SendResult(success=False, error="Recipient refused")
    except smtplib.SMTPSenderRefused:
        return SendResult(success=False, error="Sender refused")
    except smtplib.SMTPDataError as e:
        return SendResult(success=False, error=f"Data error: {e.smtp_code}")
    except Exception as e:
        return SendResult(success=False, error=str(e))


def send_batch(
    campaign_id: str,
    recipients: list[dict],
    template: str,
    subject: str,
    batch_size: int = 5,
    delay_seconds: float = 2.0
) -> None:
    from app.services.template_engine import render_template
    
    global campaigns, delivery_records
    
    total = len(recipients)
    total_batches = (total + batch_size - 1) // batch_size
    
    campaigns[campaign_id] = CampaignStatus(
        campaign_id=campaign_id,
        total=total,
        sent=0,
        failed=0,
        pending=total,
        status="running",
        current_batch=0,
        total_batches=total_batches,
        next_batch_in=0
    )
    delivery_records[campaign_id] = []
    
    for batch_num, i in enumerate(range(0, total, batch_size)):
        batch = recipients[i:i + batch_size]
        campaigns[campaign_id].current_batch = batch_num + 1
        
        for idx, recipient in enumerate(batch):
            email = recipient.get('email', '')
            name = recipient.get('name', '')
            variables = recipient.get('variables', {})
            variables['name'] = name
            variables['email'] = email
            
            rendered, error = render_template(template, variables)
            timestamp = datetime.utcnow().isoformat()
            
            if error:
                record = DeliveryRecord(
                    email=email,
                    recipient_name=name,
                    validation_status="valid",
                    send_status="failed",
                    failure_reason=error.message,
                    timestamp=timestamp
                )
                delivery_records[campaign_id].append(record)
                campaigns[campaign_id].failed += 1
                campaigns[campaign_id].pending -= 1
                continue
            
            result = send_email(email, subject, rendered, name)
            
            if result.success:
                record = DeliveryRecord(
                    email=email,
                    recipient_name=name,
                    validation_status="valid",
                    send_status="sent",
                    failure_reason=None,
                    timestamp=timestamp
                )
                campaigns[campaign_id].sent += 1
            else:
                record = DeliveryRecord(
                    email=email,
                    recipient_name=name,
                    validation_status="valid",
                    send_status="failed",
                    failure_reason=result.error,
                    timestamp=timestamp
                )
                campaigns[campaign_id].failed += 1
            
            delivery_records[campaign_id].append(record)
            campaigns[campaign_id].pending -= 1
            
            if idx < len(batch) - 1:
                jitter = random.uniform(0.5, 1.5)
                time.sleep(jitter)
        
        if i + batch_size < total:
            batch_delay = delay_seconds + random.uniform(0, delay_seconds * 0.5)
            campaigns[campaign_id].next_batch_in = batch_delay
            time.sleep(batch_delay)
            campaigns[campaign_id].next_batch_in = 0
    
    campaigns[campaign_id].status = "completed"

def get_campaign_status(campaign_id: str) -> Optional[CampaignStatus]:
    return campaigns.get(campaign_id)

def get_delivery_report(campaign_id: str) -> Optional[list[DeliveryRecord]]:
    return delivery_records.get(campaign_id)

def create_campaign_id() -> str:
    return str(uuid.uuid4())
