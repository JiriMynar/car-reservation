from flask import Blueprint, request, jsonify, session
from src.models.models import User, db
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or user.role.name != 'Administrator':
            return jsonify({'error': 'Administrator privileges required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password) and user.is_active:
        session['user_id'] = user.id
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
    else:
        return jsonify({'error': 'Invalid credentials or inactive account'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    user = User.query.get(session['user_id'])
    if user:
        return jsonify(user.to_dict()), 200
    else:
        return jsonify({'error': 'User not found'}), 404

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user and user.is_active:
            return jsonify({
                'authenticated': True,
                'user': user.to_dict()
            }), 200
    
    return jsonify({'authenticated': False}), 200

