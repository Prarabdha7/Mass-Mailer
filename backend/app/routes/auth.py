from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.services.rate_limiter import rate_limit

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/token', methods=['POST'])
@rate_limit
def token_login():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'Request body required'}), 400
    access_token = data.get('access_token')
    if not access_token:
        return jsonify({'success': False, 'error': 'Access token is required'}), 400
    result = AuthService.authenticate_token(access_token)
    if result:
        return jsonify(result), 200
    return jsonify({'success': False, 'error': 'Invalid access token'}), 401

@auth_bp.route('/validate', methods=['POST'])
@rate_limit
def validate():
    data = request.get_json()
    if not data:
        return jsonify({'valid': False, 'error': 'Request body required'}), 400
    session_token = data.get('session_token')
    if not session_token:
        return jsonify({'valid': False, 'error': 'Session token is required'}), 400
    result = AuthService.validate_session(session_token)
    if result:
        return jsonify(result), 200
    return jsonify({'valid': False, 'error': 'Session expired, please login again'}), 401

@auth_bp.route('/logout', methods=['POST'])
@rate_limit
def logout():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'Request body required'}), 400
    session_token = data.get('session_token')
    if not session_token:
        return jsonify({'success': False, 'error': 'Session token is required'}), 400
    AuthService.invalidate_session(session_token)
    return jsonify({'success': True}), 200
