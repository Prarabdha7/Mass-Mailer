from flask import Flask
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = Config.SECRET_KEY
    
    from app.routes import api
    app.register_blueprint(api, url_prefix='/api')
    
    return app
