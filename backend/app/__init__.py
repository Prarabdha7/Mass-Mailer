from flask import Flask, send_from_directory
from app.config import Config
import os

def create_app():
    frontend_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'frontend')
    app = Flask(__name__, static_folder=frontend_folder, static_url_path='')
    app.config['SECRET_KEY'] = Config.SECRET_KEY
    
    from app.routes import api
    app.register_blueprint(api, url_prefix='/api')
    
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)
    
    from app.routes.templates import templates_bp
    app.register_blueprint(templates_bp)
    
    from app.config import get_smtp_config_from_env
    from app.services.smtp_client import configure_smtp
    env_smtp = get_smtp_config_from_env()
    if env_smtp:
        configure_smtp(env_smtp)
    
    @app.route('/')
    def serve_index():
        return send_from_directory(frontend_folder, 'login.html')
    
    @app.route('/login')
    def serve_login():
        return send_from_directory(frontend_folder, 'login.html')
    
    @app.route('/dashboard')
    def serve_dashboard():
        return send_from_directory(frontend_folder, 'dashboard.html')
    
    @app.route('/<path:path>')
    def serve_static(path):
        return send_from_directory(frontend_folder, path)
    
    return app
