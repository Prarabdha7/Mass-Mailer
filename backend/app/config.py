import os
import yaml
import secrets
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

def load_yaml_config():
    config_path = Path(__file__).parent.parent.parent / "config" / "app.yaml"
    if config_path.exists():
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    return {}

yaml_config = load_yaml_config()

def generate_secure_key():
    return secrets.token_hex(32)

class Config:
    _secret = os.getenv('SECRET_KEY', '')
    SECRET_KEY = _secret if _secret and _secret != 'dev-secret-key' else generate_secure_key()
    
    SERVER_HOST = yaml_config.get('server', {}).get('host', '0.0.0.0')
    SERVER_PORT = yaml_config.get('server', {}).get('port', 5000)
    DEBUG = yaml_config.get('server', {}).get('debug', False)
    
    SMTP_HOST = os.getenv('SMTP_HOST', '')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
    SMTP_FROM_EMAIL = os.getenv('SMTP_FROM_EMAIL', '')
    SMTP_FROM_NAME = os.getenv('SMTP_FROM_NAME', '')
    SMTP_USE_TLS = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
    
    EMAIL_BATCH_SIZE = yaml_config.get('email', {}).get('batch_size', 10)
    EMAIL_DELAY_SECONDS = yaml_config.get('email', {}).get('delay_seconds', 1.0)
    EMAIL_MAX_RETRIES = yaml_config.get('email', {}).get('max_retries', 3)
    
    ADMIN_ACCESS_TOKEN = os.getenv('ADMIN_ACCESS_TOKEN', '')
    
    RATE_LIMIT_PER_MINUTE = yaml_config.get('rate_limiting', {}).get('requests_per_minute', 60)
    RATE_LIMIT_BURST = yaml_config.get('rate_limiting', {}).get('burst_limit', 10)
    
    SESSION_STORAGE_FILE = yaml_config.get('session', {}).get('storage_file', 'sessions.json')

def get_smtp_config_from_env():
    from app.services.smtp_client import SMTPConfig
    
    if not Config.SMTP_HOST or not Config.SMTP_USERNAME:
        return None
    
    return SMTPConfig(
        host=Config.SMTP_HOST,
        port=Config.SMTP_PORT,
        username=Config.SMTP_USERNAME,
        password=Config.SMTP_PASSWORD,
        from_email=Config.SMTP_FROM_EMAIL,
        use_tls=Config.SMTP_USE_TLS,
        from_name=Config.SMTP_FROM_NAME or None
    )
