from flask import Blueprint, jsonify, request, Response
import csv
import io
from app.services.email_validator import validate_emails_batch
from app.services.smtp_client import (
    SMTPConfig,
    configure_smtp,
    send_batch,
    get_campaign_status,
    get_delivery_report,
    create_campaign_id
)
from app.services.rate_limiter import rate_limit
from app.services.auth_service import AuthService
from functools import wraps
import threading

api = Blueprint('api', __name__)

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            result = AuthService.validate_session(token)
            if result and result.get('valid'):
                return f(*args, **kwargs)
        return jsonify({'error': 'Unauthorized'}), 401
    return decorated_function

@api.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

@api.route('/validate-emails', methods=['POST'])
@rate_limit
@require_auth
def validate_emails():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Invalid JSON in request body'}), 400
    
    emails = data.get('emails')
    if emails is None:
        return jsonify({'error': 'Missing required field: emails'}), 400
    
    if not isinstance(emails, list):
        return jsonify({'error': 'Field emails must be a list'}), 400
    
    if len(emails) > 1000:
        return jsonify({'error': 'Maximum 1000 emails per request'}), 400
    
    results = validate_emails_batch(emails)
    return jsonify({'results': [r.to_dict() for r in results]})

@api.route('/configure-smtp', methods=['POST'])
@rate_limit
@require_auth
def configure_smtp_endpoint():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Invalid JSON in request body'}), 400
    
    required_fields = ['host', 'port', 'username', 'password', 'from_email']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    config = SMTPConfig(
        host=data['host'],
        port=int(data['port']),
        username=data['username'],
        password=data['password'],
        from_email=data['from_email'],
        use_tls=data.get('use_tls', True),
        from_name=data.get('from_name')
    )
    
    success, error = configure_smtp(config)
    
    if success:
        return jsonify({'status': 'success', 'message': 'SMTP configured successfully'})
    
    if error == "SMTP authentication failed":
        return jsonify({'error': error}), 401
    
    return jsonify({'error': error}), 500

@api.route('/send-campaign', methods=['POST'])
@rate_limit
@require_auth
def send_campaign_endpoint():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Invalid JSON in request body'}), 400
    
    required_fields = ['recipients', 'template', 'subject']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    recipients = data['recipients']
    if not isinstance(recipients, list):
        return jsonify({'error': 'Field recipients must be a list'}), 400
    
    if len(recipients) > 10000:
        return jsonify({'error': 'Maximum 10000 recipients per campaign'}), 400
    
    template = data['template']
    if len(template) > 500000:
        return jsonify({'error': 'Template too large (max 500KB)'}), 400
    
    subject = data['subject']
    if len(subject) > 500:
        return jsonify({'error': 'Subject too long (max 500 characters)'}), 400
    
    batch_size = data.get('batch_size', 10)
    delay_seconds = data.get('delay_seconds', 1.0)
    
    campaign_id = create_campaign_id()
    
    thread = threading.Thread(
        target=send_batch,
        args=(campaign_id, recipients, template, subject, batch_size, delay_seconds)
    )
    thread.start()
    
    return jsonify({
        'status': 'started',
        'campaign_id': campaign_id,
        'message': 'Campaign started successfully'
    })

@api.route('/campaign-status/<campaign_id>', methods=['GET'])
@rate_limit
@require_auth
def campaign_status_endpoint(campaign_id):
    status = get_campaign_status(campaign_id)
    
    if not status:
        return jsonify({'error': f'Campaign {campaign_id} not found'}), 404
    
    return jsonify(status.to_dict())

@api.route('/delivery-report/<campaign_id>', methods=['GET'])
@rate_limit
@require_auth
def delivery_report_endpoint(campaign_id):
    records = get_delivery_report(campaign_id)
    
    if records is None:
        return jsonify({'error': f'Campaign {campaign_id} not found'}), 404
    
    return jsonify({'records': [r.to_dict() for r in records]})

@api.route('/delivery-report/<campaign_id>/csv', methods=['GET'])
@rate_limit
@require_auth
def delivery_report_csv_endpoint(campaign_id):
    records = get_delivery_report(campaign_id)
    
    if records is None:
        return jsonify({'error': f'Campaign {campaign_id} not found'}), 404
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['email', 'recipient_name', 'validation_status', 'send_status', 'failure_reason', 'timestamp'])
    
    for record in records:
        writer.writerow([
            record.email,
            record.recipient_name,
            record.validation_status,
            record.send_status,
            record.failure_reason or '',
            record.timestamp
        ])
    
    csv_content = output.getvalue()
    output.close()
    
    return Response(
        csv_content,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename=delivery-report-{campaign_id}.csv'}
    )
