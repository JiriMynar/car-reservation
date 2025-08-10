import os
import sys
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(stream=sys.stdout, level=logging.INFO)

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.models import db, Role, User
from src.routes.auth import auth_bp
from src.routes.vehicles import vehicles_bp
from src.routes.reservations import reservations_bp
from src.routes.users import users_bp
from src.routes.service_records import service_records_bp
from src.routes.damage_records import damage_records_bp
from src.routes.reports import reports_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configuration for production
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key-for-development')
FRONTEND_URL = os.environ.get('FRONTEND_URL', '')
# Set secure cookie flags for cross-site (static frontend on different domain)
if FRONTEND_URL.startswith('https://'):
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_HTTPONLY'] = True
from urllib.parse import urlparse
frontend_origin = os.environ.get('FRONTEND_URL', '')
if frontend_origin:
    CORS(app, resources={r"/api/*": {"origins": [frontend_origin]}}, supports_credentials=True)
else:
    # Fallback for local dev without credentials
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=False)

# Database configuration for PostgreSQL
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    # Fix for Render.com PostgreSQL URL format
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    # Fallback to SQLite for local development
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(vehicles_bp, url_prefix='/api')
app.register_blueprint(reservations_bp, url_prefix='/api')
app.register_blueprint(users_bp, url_prefix='/api')
app.register_blueprint(service_records_bp, url_prefix='/api')
app.register_blueprint(damage_records_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api')

# Initialize database
db.init_app(app)

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

def create_default_data():
    """Create default roles and admin user if they don't exist"""
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create default roles
        if not Role.query.filter_by(name='Uživatel').first():
            user_role = Role(name='Uživatel', description='Základní uživatel systému')
            db.session.add(user_role)
        
        if not Role.query.filter_by(name='Administrator').first():
            admin_role = Role(name='Administrator', description='Administrátor systému')
            db.session.add(admin_role)
        
        db.session.commit()
        
        # Create default admin user
        admin_role = Role.query.filter_by(name='Administrator').first()
        user_role = Role.query.filter_by(name='Uživatel').first()
        
        if not User.query.filter_by(username='admin').first():
            admin_user = User(
                username='admin',
                email='admin@car11.com',
                password_hash='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPyV2yvO',  # adminpass
                full_name='Administrátor Systému',
                corporate_id='ADMIN001',
                department='IT',
                phone='+420123456789',
                role_id=admin_role.id,
                is_active=True
            )
            db.session.add(admin_user)
        
        if not User.query.filter_by(username='user').first():
            regular_user = User(
                username='user',
                email='user@car11.com',
                password_hash='$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  # userpass
                full_name='Testovací Uživatel',
                corporate_id='USER001',
                department='Testování',
                phone='+420987654321',
                role_id=user_role.id,
                is_active=True
            )
            db.session.add(regular_user)
        
        db.session.commit()

# --- Ensure database tables exist and default data is seeded on startup (works under gunicorn) ---
try:
    with app.app_context():
        db.create_all()
        create_default_data()
except Exception as e:
    # Log but don't crash the app
    print(f"[startup] DB init/seed failed: {e}", flush=True)


# --- Healthcheck endpoint for Render ---
@app.get('/healthz')
def healthz():
    return {'status': 'ok'}, 200

if __name__ == '__main__':
    create_default_data()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

