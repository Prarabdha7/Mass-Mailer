#!/usr/bin/env python
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

import click
from dotenv import load_dotenv

load_dotenv()

@click.group()
def cli():
    """Mass Mailer CLI - Send emails and manage campaigns"""
    pass

@cli.command()
@click.option('--host', default=None, help='SMTP host (overrides .env)')
@click.option('--port', default=None, type=int, help='SMTP port (overrides .env)')
@click.option('--username', default=None, help='SMTP username (overrides .env)')
@click.option('--password', default=None, help='SMTP password (overrides .env)')
def test_smtp(host, port, username, password):
    """Test SMTP connection"""
    from app.config import Config, get_smtp_config_from_env
    from app.services.smtp_client import SMTPConfig, configure_smtp
    
    if host and username and password:
        config = SMTPConfig(
            host=host,
            port=port or 587,
            username=username,
            password=password,
            from_email=os.getenv('SMTP_FROM_EMAIL', username),
            use_tls=True
        )
    else:
        config = get_smtp_config_from_env()
        if not config:
            click.echo("Error: SMTP not configured. Set env vars or use --host --username --password")
            return
    
    click.echo(f"Testing connection to {config.host}:{config.port}...")
    success, error = configure_smtp(config)
    
    if success:
        click.echo("SMTP connection successful!")
    else:
        click.echo(f"SMTP connection failed: {error}")

@cli.command()
@click.option('--to', required=True, help='Recipient email address')
@click.option('--subject', required=True, help='Email subject')
@click.option('--message', required=True, help='Email message (HTML supported)')
@click.option('--name', default='', help='Recipient name for personalization')
def send(to, subject, message, name):
    """Send a single email"""
    from app.config import get_smtp_config_from_env
    from app.services.smtp_client import configure_smtp, send_email
    
    config = get_smtp_config_from_env()
    if not config:
        click.echo("Error: SMTP not configured. Set SMTP_* env vars in .env")
        return
    
    click.echo(f"Configuring SMTP...")
    success, error = configure_smtp(config)
    if not success:
        click.echo(f"SMTP configuration failed: {error}")
        return
    
    click.echo(f"Sending email to {to}...")
    result = send_email(to, subject, message, name)
    
    if result.success:
        click.echo("Email sent successfully!")
    else:
        click.echo(f"Failed to send email: {result.error}")


@cli.command()
@click.option('--recipients', required=True, type=click.Path(exists=True), help='JSON file with recipients list')
@click.option('--template', required=True, type=click.Path(exists=True), help='HTML template file')
@click.option('--subject', required=True, help='Email subject')
@click.option('--batch-size', default=10, help='Emails per batch')
@click.option('--delay', default=1.0, help='Delay between batches (seconds)')
def campaign(recipients, template, subject, batch_size, delay):
    """Send a campaign to multiple recipients"""
    import json
    from app.config import get_smtp_config_from_env
    from app.services.smtp_client import configure_smtp, send_batch, get_campaign_status, create_campaign_id
    import time
    
    config = get_smtp_config_from_env()
    if not config:
        click.echo("Error: SMTP not configured. Set SMTP_* env vars in .env")
        return
    
    with open(recipients, 'r') as f:
        recipient_list = json.load(f)
    
    with open(template, 'r') as f:
        template_content = f.read()
    
    click.echo(f"Configuring SMTP...")
    success, error = configure_smtp(config)
    if not success:
        click.echo(f"SMTP configuration failed: {error}")
        return
    
    campaign_id = create_campaign_id()
    click.echo(f"Starting campaign {campaign_id} with {len(recipient_list)} recipients...")
    
    import threading
    thread = threading.Thread(
        target=send_batch,
        args=(campaign_id, recipient_list, template_content, subject, batch_size, delay)
    )
    thread.start()
    
    while thread.is_alive():
        status = get_campaign_status(campaign_id)
        if status:
            click.echo(f"Progress: {status.sent} sent, {status.failed} failed, {status.pending} pending")
        time.sleep(2)
    
    status = get_campaign_status(campaign_id)
    click.echo(f"\nCampaign completed!")
    click.echo(f"Total: {status.total}, Sent: {status.sent}, Failed: {status.failed}")

@cli.command()
def server():
    """Run the Flask API server"""
    from app import create_app
    from app.config import Config
    
    app = create_app()
    click.echo(f"Starting server on {Config.SERVER_HOST}:{Config.SERVER_PORT}")
    app.run(host=Config.SERVER_HOST, port=Config.SERVER_PORT, debug=Config.DEBUG)

@cli.command()
@click.argument('emails', nargs=-1)
def validate(emails):
    """Validate email addresses"""
    from app.services.email_validator import validate_email
    
    for email in emails:
        result = validate_email(email)
        status_icon = "✓" if result.status == "valid" else "✗"
        reason = f" ({result.reason})" if result.reason else ""
        click.echo(f"{status_icon} {email}: {result.status}{reason}")

if __name__ == '__main__':
    cli()
