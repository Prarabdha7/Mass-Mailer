from flask import Blueprint, jsonify, request
from app.services.rate_limiter import rate_limit
from app.services.auth_service import AuthService
from functools import wraps
import json
import os
from pathlib import Path

templates_bp = Blueprint('templates', __name__, url_prefix='/api/templates')

DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"
TEMPLATES_FILE = DATA_DIR / "custom_templates.json"
LOGS_FILE = DATA_DIR / "activity_logs.json"

def ensure_data_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

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

def load_json_file(filepath):
    if filepath.exists():
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_json_file(filepath, data):
    ensure_data_dir()
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

@templates_bp.route('', methods=['GET'])
@rate_limit
@require_auth
def get_templates():
    ensure_data_dir()
    templates = load_json_file(TEMPLATES_FILE)
    return jsonify({'templates': templates})

@templates_bp.route('', methods=['POST'])
@rate_limit
@require_auth
def save_template():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400
    
    name = data.get('name', '').strip()
    content = data.get('content', '').strip()
    
    if not name or not content:
        return jsonify({'error': 'Name and content are required'}), 400
    
    templates = load_json_file(TEMPLATES_FILE)
    
    from datetime import datetime
    template = {
        'id': len(templates) + 1,
        'name': name,
        'content': content,
        'createdAt': datetime.utcnow().isoformat() + 'Z'
    }
    templates.append(template)
    save_json_file(TEMPLATES_FILE, templates)
    
    return jsonify({'success': True, 'template': template})

@templates_bp.route('/<int:template_id>', methods=['PUT'])
@rate_limit
@require_auth
def update_template(template_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400
    
    templates = load_json_file(TEMPLATES_FILE)
    
    for t in templates:
        if t.get('id') == template_id:
            if 'name' in data:
                t['name'] = data['name'].strip()
            if 'content' in data:
                t['content'] = data['content'].strip()
            from datetime import datetime
            t['updatedAt'] = datetime.utcnow().isoformat() + 'Z'
            save_json_file(TEMPLATES_FILE, templates)
            return jsonify({'success': True, 'template': t})
    
    return jsonify({'error': 'Template not found'}), 404

@templates_bp.route('/<int:template_id>', methods=['DELETE'])
@rate_limit
@require_auth
def delete_template(template_id):
    templates = load_json_file(TEMPLATES_FILE)
    templates = [t for t in templates if t.get('id') != template_id]
    save_json_file(TEMPLATES_FILE, templates)
    return jsonify({'success': True})

@templates_bp.route('/logs', methods=['GET'])
@rate_limit
@require_auth
def get_logs():
    logs = load_json_file(LOGS_FILE)
    return jsonify({'logs': logs[-500:]})

@templates_bp.route('/logs', methods=['POST'])
@rate_limit
@require_auth
def add_log():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400
    
    logs = load_json_file(LOGS_FILE)
    
    from datetime import datetime
    log = {
        'id': len(logs) + 1,
        'type': data.get('type', 'info'),
        'message': data.get('message', ''),
        'details': data.get('details'),
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
    logs.append(log)
    
    if len(logs) > 1000:
        logs = logs[-500:]
    
    save_json_file(LOGS_FILE, logs)
    return jsonify({'success': True, 'log': log})

@templates_bp.route('/logs', methods=['DELETE'])
@rate_limit
@require_auth
def clear_logs():
    save_json_file(LOGS_FILE, [])
    return jsonify({'success': True})
