from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .models import db
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    basedir = os.path.abspath(os.path.dirname(__file__))
    # Force DB to be in the project root folder (next to backend/ and frontend-react/)
    db_path = os.path.join(os.path.dirname(os.path.dirname(basedir)), 'ecotrade.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
    
    # Initialize Extensions
    db.init_app(app)
    CORS(app)
    JWTManager(app)
    
    # Register Blueprints
    from .routes import main_bp
    app.register_blueprint(main_bp, url_prefix='/api')
    
    return app
