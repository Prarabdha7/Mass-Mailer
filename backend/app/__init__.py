from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'dev-secret-key'
    
    from app.routes import api
    app.register_blueprint(api, url_prefix='/api')
    
    return app
